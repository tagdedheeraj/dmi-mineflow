
import { 
  signInWithEmailAndPassword as firebaseSignInWithEmail,
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  confirmPasswordReset
} from "firebase/auth";
import { auth } from "./config";

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
