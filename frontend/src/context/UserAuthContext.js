import { 
  createContext, 
  useContext, 
  useEffect, 
  useState } 
from "react";
import { auth } from '../firebase/firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup, GoogleAuthProvider
} from "firebase/auth";

// userAuthContext : Manage Authentication Across App

//create a context
const userAuthContext = createContext();

//create a provider component
export function UserAuthProvider({ children }) {
    const [user, setUser] = useState({});

    // Check auth state on mount
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentuser) => {
        console.log("Auth", currentuser);
        setUser(currentuser);
      });
    
      return () => { unsubscribe();};
    }, []);
  
    // SIGN, LOGIN, LOGOUT, GOOGLE SIGNIN functions
    function signUp(email, password) {
      return createUserWithEmailAndPassword(auth, email, password);
    }
    function logIn(email, password) {
      return signInWithEmailAndPassword(auth, email, password);
    }
    function logOut() {
      return signOut(auth);
    }
    function googleSignIn() {
      const googleAuthProvider = new GoogleAuthProvider();
      return signInWithPopup(auth, googleAuthProvider);
    }

    return (
      <userAuthContext.Provider
        value={{ user, signUp, logIn, logOut, googleSignIn }}
      >
        {children}
      </userAuthContext.Provider>
    );
}

// Custom hook to use auth context
export function useUserAuth() {
  return useContext(userAuthContext);
}
