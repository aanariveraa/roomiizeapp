import { 
  createContext, 
  useContext, 
  useEffect, 
  useState } 
from "react";
import { auth , db} from '../firebase/firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup, 
  GoogleAuthProvider, 
  updateProfile
} from "firebase/auth";
import { doc, updateDoc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { unsubscribeAllListeners } from "../services/firestoreUnsubscribeService"; 


//userAuthContext : Manage Authentication Across App
//create a context
const userAuthContext = createContext();

//default profile pic 
const DEFAULT_PROFILE_PIC =
  "https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small_2x/profile-icon-design-free-vector.jpg";


//create a provider component
export function UserAuthProvider({ children }) {
    const [user, setUser] = useState(null); 

    // Check auth state on mount
    useEffect(() => {
      console.log(" Setting up auth state listener...");
      
      const unsubscribe = onAuthStateChanged(auth, async (currentuser) => {
        if(currentuser){
          console.log(" User logged in:", currentuser);
          setUser(currentuser);

          const userRef = doc(db, "users", currentuser.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            console.warn("No user document found. Creating one...");
            await setDoc(userRef, {
              uid: currentuser.uid,
              email: currentuser.email,
              displayName: currentuser.displayName || "",
              photoURL: currentuser.photoURL || DEFAULT_PROFILE_PIC,
              createdAt: new Date(),
              isOnline: true
            });
          } else {
            await updateDoc(userRef, { isOnline: true });
          }

          // Handle tab close / browser unload
          const handleBeforeUnload = async () => {
            await updateDoc(userRef, { isOnline: false });
          };
          
          window.addEventListener("beforeunload", handleBeforeUnload);

          return () => {
            console.log("Cleaning up onAuthStateChanged...");
            window.removeEventListener("beforeunload", handleBeforeUnload);
            updateDoc(userRef, { isOnline: false }).catch((error) => {
              console.warn("Failed to mark offline on cleanup.", error);
            });
          };
        }else{
          console.log(" No user logged in.");
          setUser(null);
        }   
      });
    
      return () => { 
        console.log(" Cleaning up auth state listener...");
        unsubscribe();
      };
    }, []);
  
    // SIGN UP + save user data
    async function signUp(email, password, name, profilePic = "" ) {
      try{
          console.log("📝 Signing up user:", email);
          //createAccount
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const newUser = userCredential.user;


           // If no profilePic is provided (i.e., manual sign-up), use the default picture.
          if (!profilePic) {
            profilePic = DEFAULT_PROFILE_PIC;
          }

          // Update Firebase Auth profile
          await updateProfile(newUser, {
            displayName: name,
            photoURL: profilePic,
          });

          // Save user info in Firestore
          //setDoc - save
          await setDoc(doc(db, "users", newUser.uid), {
            uid: newUser.uid,
            email: newUser.email,
            displayName: name,
            photoURL: profilePic || "", 
            createdAt: new Date(),
            isOnline: true
          });

          // 4️⃣ Update Global User State
         /*setUser({
            uid: newUser.uid,
            email: newUser.email,
            displayName: name,
            photoURL: profilePic,
          });*/
          setUser(newUser); 
          //FULL FIREBASE user object
          //full access to firebase methods

          console.log("Signup complete:", newUser.email);
          return newUser;

      }catch (error) {
        console.error(" Error signing up:", error.message);
        throw error;
      }  
    }

    // LOGIN
    async function logIn(email, password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log(" Login successful:", userCredential.user.email);
        return userCredential.user;

      } catch (error) {
        console.error("Login failed:", error.message);
        throw error;
      }
    }

    // LOGOUT
    // clear firebase auth sessions, reset global state
    async function logOut() {
      try {
        console.log("Logging out user...");

        // 1. Unsubscribe first before signOut
        unsubscribeAllListeners();

        // 2. Set user offline (safe attempt)
        if (auth.currentUser) {
          try {
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, { isOnline: false });
          } catch (error) {
            console.warn("Failed to mark user offline. Proceeding to sign out anyway.", error);
          }
        }

        // 3. Sign out
        await signOut(auth);
        console.log(" User logged out.");

        // 4. Clear local user state
        setUser(null); // Ensure state is update
        
      } catch (error) {
        console.error("Logout error:", error.message);
        throw error;
      }
    }

    // GOOGLE SIGN IN + save user data
    async function googleSignIn() {
      try{
        console.log("Signing in with Google...");

        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const googleUser = userCredential.user;
    
        console.log("Google Sign-in successful:", googleUser.email);

        // Check if user already exists in Firestore
        // Save Google user info in Firestore (if not exists)
        const userRef = doc(db, "users", googleUser.uid);
        const userSnapshot = await getDoc(userRef);
    
        if (!userSnapshot.exists()) {
          console.log("📁 Saving new Google user to Firestore...");
          await setDoc(userRef, {
            uid: googleUser.uid,
            email: googleUser.email,
            displayName: googleUser.displayName || "",
            photoURL: googleUser.photoURL || "",
            createdAt: new Date(),
            isOnline: true
          });
        }

        /*setUser({
          uid: googleUser.uid,
          email: googleUser.email,
          displayName: googleUser.displayName,
          photoURL: googleUser.photoURL,
          providerData: googleUser.providerData, 
        });*/
        setUser(googleUser);
        //FULL FIREBASE user object
          //full access to firebase methods

        return googleUser;

      }catch (error) {
        console.error("Google Sign-in error:", error.message);
        throw error;
      }
    }

    return (
      <userAuthContext.Provider
        value={{ user, signUp, logIn, logOut, googleSignIn }}>
        {children}
      </userAuthContext.Provider>
    );
}

// Custom hook to use auth context
export function useUserAuth() {
  return useContext(userAuthContext);
}
