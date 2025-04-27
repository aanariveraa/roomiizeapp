import React, { useEffect, useState } from "react";
import { useUserAuth } from "../context/UserAuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { 
  doc,
  collection,
  addDoc,
  setDoc, 
  getDoc, 
  getDocs,
  serverTimestamp, 
  onSnapshot,
  writeBatch, 
  query, 
  where,
  deleteDoc
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Create a new room 
export async function createRoom(roomData) {
  try {
    //automatically creates a unique document ID when you call addDoc
    const docRef = await addDoc(collection(db, "rooms"), {
      ...roomData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log(`Room created successfully with id: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
}

// Save or update room metadata
export const saveRoomMetadata = async (roomId, roomMetadata) => {
  try {
    const roomDocRef = doc(db, "rooms", roomId.toString());
    await setDoc(
      roomDocRef,
      {
        ...roomMetadata,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    console.log("Room metadata saved successfully!");
  } catch (error) {
    console.error("Error saving room metadata:", error);
  }
};


// Save room items to the Items subcollection
export const saveRoomItems = async (roomId, items) => {
  try {
    if (!items || items.length === 0) {
      console.warn("🛑 No items to save.");
      return;
    }

    console.log("🔥 saveRoomItems CALLED with:", items.map(item => ({
      uid: item.uid,
      position: item.position,
      rotation: item.rotation
    })));

    const batch = writeBatch(db);
    items.forEach((item) => {
      console.log("🔥🔥 FINAL item data to save:", item.uid, item.position, item.rotation); // NEW
      const itemDocRef = doc(db, "rooms", roomId.toString(), "Items", item.uid.toString());

      batch.set(itemDocRef, {
        ...item,
        position: item.position || [0, 0, 0],
        rotation: item.rotation || [0, 0, 0],
        updatedAt: serverTimestamp(), 
      });
    });

    await batch.commit();
    console.log("✅ Room items saved to Firestore.");
    items.forEach(item => {
      console.log(`🧩 ${item.name || item.uid} 
        -> pos: ${item.position.map(n => n.toFixed(2))},
         rot: ${item.rotation.map(n => n.toFixed(2))}`);
    });
    
  } catch (error) {
    console.error("❌ Error saving room items:", error);
  }
};


// Load data for a single room including its items
export async function loadRoomData(roomId) {
  try {
    const roomDocRef = doc(db, "rooms", roomId.toString());
    const roomSnap = await getDoc(roomDocRef);
    if (!roomSnap.exists()) {
      console.log("No saved data for this room.");
      return null;
    }
    const roomData = roomSnap.data();
    const itemsColRef = collection(db, "rooms", roomId.toString(), "Items");
    const itemsSnapshot = await getDocs(itemsColRef);
    const items = [];

    itemsSnapshot.forEach((doc) => {
      const data = doc.data();
      items.push({ 
        //id: doc.id, ...doc.data() 
        id: doc.id,
        ...data,
        position: Array.isArray(data.position) ? data.position.map(Number) : [0, 0, 0],
        rotation: Array.isArray(data.rotation) ? data.rotation.map(Number) : [0, 0, 0],
      });
    });
    return { ...roomData, items };
  } catch (error) {
    console.error("Error loading room data:", error);
    throw error;
  }
}


// Load all rooms for a given user (rooms where the user's UID is in membersId)
export async function loadRooms(userId) {
  try {
    const designsRef = collection(db, "rooms");
    const q = query(designsRef, where("membersId", "array-contains", userId));
    const querySnapshot = await getDocs(q);
    const rooms = [];
    querySnapshot.forEach((doc) => {
      rooms.push({ id: doc.id, ...doc.data() });
    });
    console.log("Loaded rooms for user:", rooms);
    return rooms;
  } catch (error) {
    console.error("Error loading rooms:", error);
    throw error;
  }
}


// Update an existing room
export async function updateRoom(roomId, updatedData) {
  console.log(`Updating room ${roomId} with data:`, updatedData);
  try {
    const roomDocRef = doc(db, "rooms", roomId.toString());
    await setDoc(
      roomDocRef,
      {
        ...updatedData,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
    console.log(`Room ${roomId} updated successfully.`);
  } catch (error) {
    console.error(`Error updating room ${roomId}:`, error);
  }
}

// Subscribe to real-time room data updates
export const subscribeRoomData = (roomId, callback) => {
  const roomDocRef = doc(db, "rooms", roomId.toString());
  const itemsColRef = collection(db, "rooms", roomId.toString(), "Items");

  let unsubscribeItems = null;

  const unsubscribeRoom = onSnapshot(roomDocRef, (docSnap) => {
    const currentUser = getAuth().currentUser;
    if (!currentUser) {
      console.warn("⚠️ User logged out. Ignoring room snapshot.");
      return;
    }

    if (!docSnap.exists()) {
      callback(null);
      if (unsubscribeItems) unsubscribeItems(); // cleanup if room is deleted
      return;
    }

    const roomData = docSnap.data();

    if (unsubscribeItems) {
      unsubscribeItems(); // unsubscribe previous items listener before opening new one
    }

    unsubscribeItems = onSnapshot(itemsColRef, (querySnapshot) => {
      const currentUserInner = getAuth().currentUser;
      if (!currentUserInner) {
        console.warn("⚠️ User logged out. Ignoring items snapshot.");
        return;
      }

      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });

      callback({ ...roomData, items });
    });
  });

  return () => {
    if (unsubscribeItems) unsubscribeItems();
    unsubscribeRoom();
  };
};


//delte room item 
// Delete a specific item from a room's Items subcollection
export const deleteRoomItem = async (roomId, itemId) => {
  try {
    const itemDocRef = doc(db, "rooms", roomId.toString(), "Items", itemId.toString());
    console.log("Trying to delete doc:", `rooms/${roomId}/Items/${itemId}`);
    
    await deleteDoc(itemDocRef);
    console.log(`🗑️ Successfully deleted item ${itemId} from room ${roomId}`);
  } catch (error) {
    console.error("Error deleting item from room:", error);
  }
};


//delete a room by creator 
export const deleteRoom = async (roomId) => {
  try {
    const roomDocRef = doc(db, "rooms", roomId);
    const itemsCollection = collection(db, "rooms", roomId, "Items");

    // Delete all items
    const itemDocs = await getDocs(itemsCollection);
    const batch = writeBatch(db);
    itemDocs.forEach((docSnap) => {
      batch.delete(doc(db, "rooms", roomId, "Items", docSnap.id));
    });

    // Delete the room document
    batch.delete(roomDocRef);
    await batch.commit();

    console.log(`🔥 Deleted room ${roomId} and its items`);
  } catch (error) {
    console.error("Error deleting room:", error);
    throw error;
  }
};
