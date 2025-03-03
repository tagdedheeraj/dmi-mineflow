
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4IE8x5PdQKEF3hCD3k5A1LMDl5cZOd70",
  authDomain: "dmi-network.firebaseapp.com",
  projectId: "dmi-network",
  storageBucket: "dmi-network.firebasestorage.app",
  messagingSenderId: "836476789960",
  appId: "1:836476789960:web:6754c3a441a9243d9bf1fd",
  measurementId: "G-F0597683MK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Authentication functions
export const signInWithEmail = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const createUserWithEmail = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signOutUser = () => {
  return firebaseSignOut(auth);
};

export { app, auth, analytics };
