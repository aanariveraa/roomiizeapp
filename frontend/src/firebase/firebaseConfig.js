// //////////////////////////////////////////////////////////////////
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider} from 'firebase/auth';
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage"; // Add Storage (if needed) 
import { getDatabase } from "firebase/database";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9sGAlISkMu-hCegJ5WiYJVdJr1PYzXtE",
  authDomain: "roomiize-1c8df.firebaseapp.com",
  databaseURL: "https://roomiize-1c8df-default-rtdb.firebaseio.com",
  projectId: "roomiize-1c8df",
  storageBucket: "roomiize-1c8df.firebasestorage.app",
  messagingSenderId: "81579009280",
  appId: "1:81579009280:web:df50a21365cd66fa327fe5",
  measurementId: "G-MR0XSKV259"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Initialize Authentication 
const db = getFirestore(app); // Initialize Firestore 
const storage = getStorage(app); // Initialize Storage 
const database = getDatabase(app); // Initilize Realtime databse 

//export 
export { db, auth, storage };
export default app;


////////////////////////////////////////////////////////////////////
