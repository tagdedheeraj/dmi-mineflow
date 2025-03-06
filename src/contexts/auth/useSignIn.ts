
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/storage/types';
import { 
  getUser, 
  saveUser,
  getDeviceId
} from '@/lib/firestore';
import { signInWithEmail, signOutUser } from '@/lib/firebase';
import { ADMIN_EMAIL } from './types';

export function useSignIn(
  setUser: (user: User | null) => void,
  setIsAdmin: (isAdmin: boolean) => void
) {
  const navigate = useNavigate();
  const { toast } = useToast();

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
      const firestoreUser = await getUser(firebaseUser.uid);
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
        await saveUser(updatedUser);
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
        await saveUser(newUser);
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

  return { signIn };
}
