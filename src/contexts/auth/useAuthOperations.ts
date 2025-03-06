
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/storage/types';
import { 
  getUser as getFirestoreUser, 
  saveUser as saveFirestoreUser,
  registerAccountOnDevice 
} from '@/lib/firestore';
import { 
  auth,
  signInWithEmail,
  createUserWithEmail,
  signOutUser 
} from '@/lib/firebase';
import { getDeviceId } from '@/lib/firestore';
import { ADMIN_EMAIL } from './types';

export function useAuthOperations(
  setUser: (user: User | null) => void,
  setIsAdmin: (isAdmin: boolean) => void
) {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const signUp = async (fullName: string, email: string, password: string) => {
    try {
      const deviceId = getDeviceId();
      const { isMultipleAccount, within24Hours } = await registerAccountOnDevice(deviceId, `user_${Date.now()}`);
      
      if (isMultipleAccount && within24Hours) {
        toast({
          title: "Account Creation Restricted",
          description: "You cannot create more than one account from the same device within 24 hours.",
          variant: "destructive",
        });
        navigate('/signin');
        return;
      }
      
      // Create user in Firebase
      const userCredential = await createUserWithEmail(email, password);
      const firebaseUser = userCredential.user;
      
      // Create user profile in Firestore
      const newUser: User = {
        id: firebaseUser.uid,
        fullName,
        email,
        balance: 100,
        createdAt: Date.now(),
        deviceId,
      };
      
      await saveFirestoreUser(newUser);
      setUser(newUser);
      
      toast({
        title: "Welcome to DMI Mining!",
        description: "You've received 100 DMI Coins as a welcome bonus.",
      });
      
      navigate('/mining');
    } catch (error: any) {
      let errorMessage = "An error occurred during sign up.";
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already in use. Please try a different email or sign in.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please provide a valid email address.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please use a stronger password.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Sign up error:", error);
      throw error; // Re-throw for component handling
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("AuthContext: Attempting to sign in with email:", email);
      
      // Additional validation
      if (!email || !password) {
        console.error("Email or password is empty");
        throw new Error("Email and password are required");
      }
      
      // Ensure email is lowercase
      email = email.toLowerCase();
      
      // Sign in with Firebase
      const userCredential = await signInWithEmail(email, password);
      console.log("AuthContext: Sign in successful, user ID:", userCredential.user.uid);
      
      const firebaseUser = userCredential.user;
      
      // Check if this is the admin account
      if (email === ADMIN_EMAIL) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      
      // Fetch user from Firestore
      const firestoreUser = await getFirestoreUser(firebaseUser.uid);
      console.log("AuthContext: Firestore user retrieved:", firestoreUser?.id || "not found");
      
      if (firestoreUser) {
        if (firestoreUser.suspended) {
          toast({
            title: "Account Suspended",
            description: firestoreUser.suspendedReason || "This account has been suspended.",
            variant: "destructive",
          });
          await signOutUser();
          throw new Error("Account suspended");
        }
        
        // Update deviceId
        const deviceId = getDeviceId();
        const updatedUser = {
          ...firestoreUser,
          deviceId
        };
        await saveFirestoreUser(updatedUser);
        setUser(updatedUser);
      } else {
        // Create a new user profile if it doesn't exist
        const newUser: User = {
          id: firebaseUser.uid,
          fullName: firebaseUser.displayName || email.split('@')[0] || 'User',
          email: email,
          balance: 100,
          createdAt: Date.now(),
          deviceId: getDeviceId(),
        };
        await saveFirestoreUser(newUser);
        setUser(newUser);
      }
      
      // Navigate admin to admin page, others to mining
      if (email === ADMIN_EMAIL) {
        navigate('/admin');
        toast({
          title: "Admin Login",
          description: "You've logged in as an administrator.",
        });
      } else {
        navigate('/mining');
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
      }
    } catch (error: any) {
      console.error("Sign in error details in AuthContext:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      
      let errorMessage = "Invalid email or password.";
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/invalid-credential' || 
          error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password' || 
          error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed login attempts. Please try again later or reset your password.";
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = "This account has been disabled. Please contact support.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Sign in error in AuthContext:", error);
      throw error; // Re-throw the error so the SignIn component can handle it
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
      setUser(null);
      setIsAdmin(false);
      navigate('/signin');
      toast({
        title: "Signed Out",
        description: "You've been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Sign Out Failed",
        description: error.message || "An error occurred during sign out.",
        variant: "destructive",
      });
      console.error("Sign out error:", error);
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    isLoading,
    setIsLoading
  };
}
