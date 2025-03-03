
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  AuthErrorCodes
} from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, arrayUnion, query, where, getDocs, addDoc, Timestamp, serverTimestamp } from "firebase/firestore";

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
const db = getFirestore(app);

// Authentication functions
export const signInWithEmail = async (email: string, password: string) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error("Firebase signIn error:", error);
    // Make sure the error object is properly passed through
    throw error;
  }
};

export const createUserWithEmail = async (email: string, password: string) => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error("Firebase createUser error:", error);
    // Make sure the error object is properly passed through
    throw error;
  }
};

export const signOutUser = () => {
  return firebaseSignOut(auth);
};

// Firestore collection references
export const usersCollection = collection(db, 'users');
export const miningSessionsCollection = collection(db, 'mining_sessions');
export const deviceRegistrationsCollection = collection(db, 'device_registrations');
export const plansCollection = collection(db, 'plans');

// Helper function for USDT transactions
export const addUsdtTransaction = async (
  userId: string,
  amount: number,
  type: 'deposit' | 'withdrawal' | 'refund' | 'bonus',
  description: string,
  timestamp: number
) => {
  try {
    const transactionsCollection = collection(db, 'usdt_transactions');
    await addDoc(transactionsCollection, {
      userId,
      amount,
      type,
      description,
      timestamp,
      createdAt: serverTimestamp()
    });
    
    console.log(`USDT transaction recorded for user ${userId}: ${type} ${amount}`);
  } catch (error) {
    console.error("Error adding USDT transaction:", error);
    throw error;
  }
};

export { app, auth, analytics, db };
