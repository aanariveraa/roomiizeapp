import { db } from "../firebase/firebaseConfig";
import { 
  doc,
  collection,
  setDoc, 
  getDoc, 
  getDocs,
  serverTimestamp, 
  onSnapshot,
  writeBatch
} from "firebase/firestore";

// Create a new room
export async function createRoom(roomId, roomData) {
  console.log(`Attempting to create room with id: ${roomId}`);
  try {
    const roomDocRef = doc(db, "rooms", roomId.toString());
    await setDoc(roomDocRef, {
      ...roomData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log(`Room created successfully with id: ${roomId}`);
  } catch (error) {
    console.error("Error creating room:", error);
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
    const batch = writeBatch(db);
    items.forEach((item) => {
      const itemDocRef = doc(db, "rooms", roomId.toString(), "Items", item.uid.toString());
      batch.set(itemDocRef, {
        ...item,
        placedAt: serverTimestamp(),
      });
    });
    await batch.commit();
    console.log("Room items saved successfully!");
  } catch (error) {
    console.error("Error saving room items:", error);
  }
};

// Load room data including items
export const loadRoomData = async (roomId) => {
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
      items.push({ id: doc.id, ...doc.data() });
    });
    return { ...roomData, items };
  } catch (error) {
    console.error("Error loading room data:", error);
  }
};

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
  const unsubscribeRoom = onSnapshot(roomDocRef, async (docSnap) => {
    if (!docSnap.exists()) {
      callback(null);
      return;
    }
    const roomData = docSnap.data();
    const itemsColRef = collection(db, "rooms", roomId.toString(), "Items");
    const unsubscribeItems = onSnapshot(itemsColRef, (querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      callback({ ...roomData, items });
    });
    return () => {
      unsubscribeRoom();
      unsubscribeItems();
    };
  });
  return unsubscribeRoom;
};
