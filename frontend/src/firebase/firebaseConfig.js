/ //////////////////////////////////////////////////////////////////
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check"; // ← App check

import { getAuth } from 'firebase/auth';
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

//  Initialize AppCheck immediately 
/*initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6Le-6CYrAAAAAL9HfXGn3VxC2rBnH_VoKafmlxgz'),
  isTokenAutoRefreshEnabled: true,
});*/

//more tools
const auth = getAuth(app); // Initialize Authentication 
const db = getFirestore(app); // Initialize Firestore 
const storage = getStorage(app); // Initialize Storage 
const database = getDatabase(app); // Initilize Realtime databse 

//export 
export { app, auth, db, storage, database, firebaseConfig };
export default app;


////////////////////////////////////////////////////////////////////