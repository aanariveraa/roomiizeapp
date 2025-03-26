// useRooms.js - a custom hook
import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useUserAuth } from "../../context/UserAuthContext";

export function useRooms() {
  const { user } = useUserAuth();
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      if (!user) return;
      const q = query(collection(db, "rooms"), where("membersId", "array-contains", user.uid));
      const querySnapshot = await getDocs(q);
      const fetchedRooms = [];
      querySnapshot.forEach((doc) => {
        fetchedRooms.push({ id: doc.id, ...doc.data() });
      });
      setRooms(fetchedRooms);
    };
    fetchRooms();
  }, [user]);

  return rooms;
}
