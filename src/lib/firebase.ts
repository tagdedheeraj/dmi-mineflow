
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInWithEmailAndPassword as firebaseSignInWithEmail,
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
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

export const resetPassword = async (email: string) => {
  try {
    email = email.toLowerCase().trim();
    
    if (!email) {
      throw new Error('Email is required');
    }
    
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

export const confirmPasswordChange = async (oobCode: string, newPassword: string) => {
  try {
    await confirmPasswordReset(auth, oobCode, newPassword);
    return true;
  } catch (error) {
    console.error("Error confirming password reset:", error);
    throw error;
  }
};

// Firestore collection references
export const usersCollection = collection(db, 'users');
export const miningSessionsCollection = collection(db, 'mining_sessions');
export const deviceRegistrationsCollection = collection(db, 'device_registrations');
export const plansCollection = collection(db, 'plans');
export const membershipCardsCollection = collection(db, 'membership_cards');

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

// Check if user has an active membership
export const hasActiveMembership = async (userId: string): Promise<boolean> => {
  try {
    const membershipRef = collection(db, 'membership_cards');
    const q = query(
      membershipRef,
      where("userId", "==", userId),
      where("isActive", "==", true),
      where("expiresAt", ">=", new Date())
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking active membership:", error);
    return false;
  }
};

// Get user's active membership details
export const getActiveMembership = async (userId: string): Promise<any | null> => {
  try {
    const membershipRef = collection(db, 'membership_cards');
    const q = query(
      membershipRef,
      where("userId", "==", userId),
      where("isActive", "==", true),
      where("expiresAt", ">=", new Date())
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error getting active membership:", error);
    return null;
  }
};

// Save membership card data
export const saveMembershipCard = async (
  userId: string,
  planId: string,
  price: number,
  durationDays: number,
  boostMultiplier: number,
  transactionId?: string
): Promise<string> => {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (durationDays * 24 * 60 * 60 * 1000));
    
    const membershipData = {
      userId,
      planId,
      price,
      purchasedAt: now,
      expiresAt,
      durationDays,
      boostMultiplier,
      isActive: transactionId ? true : false,
      transactionId
    };
    
    const docRef = await addDoc(membershipCardsCollection, membershipData);
    return docRef.id;
  } catch (error) {
    console.error("Error saving membership card:", error);
    throw error;
  }
};

// Activate membership card with transaction ID
export const activateMembershipCard = async (cardId: string, transactionId: string): Promise<boolean> => {
  try {
    const cardRef = doc(db, 'membership_cards', cardId);
    await updateDoc(cardRef, {
      isActive: true,
      transactionId,
      activatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    console.error("Error activating membership card:", error);
    return false;
  }
};

export { app, auth, analytics, db };
