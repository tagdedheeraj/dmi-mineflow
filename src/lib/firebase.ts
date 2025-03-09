import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInWithEmailAndPassword as firebaseSignInWithEmail,
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  AuthErrorCodes
} from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, arrayUnion, query, where, getDocs, addDoc, Timestamp, serverTimestamp } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4IE8x5PdQKEF3hCD3k5A1LMDl5cZOd70",
  authDomain: "dmi-network.firebaseapp.com",
  projectId: "dmi-network",
  storageBucket: "dmi-network.appspot.com",
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
    console.log(`Attempting to sign in with email: ${email}`);
    
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    // Make sure email is lowercase and trimmed
    email = email.toLowerCase().trim();
    
    // Ensure auth is initialized
    if (!auth) {
      console.error("Auth not initialized");
      throw new Error("Authentication service not initialized");
    }
    
    const userCredential = await firebaseSignInWithEmail(auth, email, password);
    console.log("Authentication successful:", userCredential.user.uid);
    return userCredential;
  } catch (error: any) {
    console.error("Firebase signIn error:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    
    // Additional logging for debugging
    if (error.code === 'auth/invalid-credential') {
      console.log("Invalid credential error - Check if email and password match records");
    } else if (error.code === 'auth/invalid-email') {
      console.log("Invalid email format");
    } else if (error.code === 'auth/user-not-found') {
      console.log("No user found with this email");
    } else if (error.code === 'auth/wrong-password') {
      console.log("Password is incorrect");
    } else if (error.code === 'auth/network-request-failed') {
      console.log("Network error - Check connection");
    }
    
    // Make sure the error object is properly passed through
    throw error;
  }
};

export const createUserWithEmail = async (email: string, password: string) => {
  try {
    // Make sure email is lowercase and trimmed
    email = email.toLowerCase().trim();
    
    console.log(`Attempting to create user with email: ${email}`);
    
    // Ensure auth is initialized
    if (!auth) {
      console.error("Auth not initialized");
      throw new Error("Authentication service not initialized");
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User creation successful:", userCredential.user.uid);
    return userCredential;
  } catch (error: any) {
    console.error("Firebase createUser error:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    
    // Make sure the error object is properly passed through
    throw error;
  }
};

export const signOutUser = () => {
  return firebaseSignOut(auth);
};

// Send password reset email function
export const sendPasswordResetEmail = async (email: string) => {
  try {
    // Make sure email is lowercase and trimmed
    email = email.toLowerCase().trim();
    
    console.log(`Attempting to send password reset email to: ${email}`);
    
    // Ensure auth is initialized
    if (!auth) {
      console.error("Auth not initialized");
      throw new Error("Authentication service not initialized");
    }
    
    await firebaseSendPasswordResetEmail(auth, email);
    console.log("Password reset email sent successfully");
    return true;
  } catch (error: any) {
    console.error("Firebase sendPasswordResetEmail error:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    
    // Make sure the error object is properly passed through
    throw error;
  }
};

// Confirm password reset function
export const confirmPasswordResetCode = async (oobCode: string, newPassword: string) => {
  try {
    console.log("Verifying password reset code");
    
    // Ensure auth is initialized
    if (!auth) {
      console.error("Auth not initialized");
      throw new Error("Authentication service not initialized");
    }
    
    // First verify the action code
    const email = await verifyPasswordResetCode(auth, oobCode);
    console.log(`Password reset code verified for email: ${email}`);
    
    // Then confirm the password reset
    await confirmPasswordReset(auth, oobCode, newPassword);
    console.log("Password reset confirmed successfully");
    
    return true;
  } catch (error: any) {
    console.error("Firebase confirmPasswordReset error:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    
    // Make sure the error object is properly passed through
    throw error;
  }
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
