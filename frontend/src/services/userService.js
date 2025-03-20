// In userService.js
import { db } from "../firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

/**
 * Search for Other Users to add
 * param {string} searchTerm - The user email to search for.
 * returns {Array} - A list of matching user objects.
 */
export const searchUsersByEmail = async (searchTerm) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      where("email", ">=", searchTerm),
      where("email", "<=", searchTerm + "\uf8ff")
    );
    const querySnapshot = await getDocs(q);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
};