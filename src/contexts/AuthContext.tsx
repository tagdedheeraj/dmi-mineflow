import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';

// Define the app settings interface
export interface AppSettings {
  version: string;
  updateUrl: string;
  editWithLovableEnabled: boolean;
}

// Define the user interface
export interface User {
  id: string;
  email: string | null;
  userName: string | null;
  photoURL: string | null;
  isAdmin: boolean;
  isApproved: boolean;
  referralCode: string | null;
  appliedReferralCode: string | null;
  createdAt: any;
  lastLogin: any;
  balance: number;
  fullName?: string;
  usdtEarnings?: number;
  usdtAddress?: string;
}

// Define the auth context interface
interface AuthContextProps {
  user: User | null;
  isAdmin: boolean;
  isApproved: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  appSettings: AppSettings;
  signUp: (email: string, password: string, userName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

// Create the auth context
const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAdmin: false,
  isApproved: false,
  isAuthenticated: false,
  loading: true,
  appSettings: {
    version: '1.0.0',
    updateUrl: 'https://dminetwork.us/download',
    editWithLovableEnabled: true
  },
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  updateUser: async () => {},
  resetPassword: async () => {},
  changePassword: async () => false
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Update the default app settings to include editWithLovableEnabled
  const [appSettings, setAppSettings] = useState<AppSettings>({
    version: '1.0.0',
    updateUrl: 'https://dminetwork.us/download',
    editWithLovableEnabled: true
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsAuthenticated(true);
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser({
            ...userData,
            balance: userData.balance || 0, // Ensure balance has a default value
            id: firebaseUser.uid // Ensure id is set
          });
          setIsAdmin(userData.isAdmin || false);
          setIsApproved(userData.isApproved || false);
        } else {
          // If user data doesn't exist in Firestore, create it
          const newUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            userName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            photoURL: firebaseUser.photoURL,
            isAdmin: false,
            isApproved: false,
            referralCode: null,
            appliedReferralCode: null,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            balance: 0
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
          setIsAdmin(false);
          setIsApproved(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsApproved(false);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load app settings from Firestore
  useEffect(() => {
    const getAppSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'app_settings', 'main'));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          // Update with editWithLovableEnabled, defaulting to true if not present
          setAppSettings({
            version: data.version || '1.0.0',
            updateUrl: data.updateUrl || 'https://dminetwork.us/download',
            editWithLovableEnabled: data.editWithLovableEnabled !== undefined ? data.editWithLovableEnabled : true
          });
          
          // Update local storage with the current version
          localStorage.setItem('appVersion', data.version || '1.0.0');
        }
      } catch (error) {
        console.error("Error loading app settings:", error);
      }
    };
    
    getAppSettings();
  }, []);

  const signUp = async (email: string, password: string, userName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update the user's profile with the userName
      await updateProfile(firebaseUser, {
        displayName: userName,
      });

      // Create user object to store in Firestore
      const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        userName: userName,
        photoURL: firebaseUser.photoURL,
        isAdmin: false,
        isApproved: false,
        referralCode: null,
        appliedReferralCode: null,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        balance: 0
      };

      // Store the user data in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);

      // Update the local state
      setUser(newUser);
      setIsAdmin(false);
      setIsApproved(false);
    } catch (error: any) {
      console.error("Error signing up:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setUser(userData);
        setIsAdmin(userData.isAdmin || false);
        setIsApproved(userData.isApproved || false);

        // Update last login timestamp
        await setDoc(doc(db, 'users', firebaseUser.uid), { lastLogin: serverTimestamp() }, { merge: true });
      } else {
        // This should ideally not happen, but handle the case where the user document is missing
        console.warn("User data missing in Firestore for user:", firebaseUser.uid);
        // You might want to sign the user out or take other appropriate action here
      }
    } catch (error: any) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setIsAdmin(false);
      setIsApproved(false);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) {
      console.error("No user is currently signed in.");
      return;
    }

    try {
      // Update the user data in Firestore
      await setDoc(doc(db, 'users', user.id), updates, { merge: true });

      // Update the local state
      setUser({ ...user, ...updates });
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };
  
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const user = auth.currentUser;
      
      if (!user || !user.email) {
        console.error("No user is currently signed in.");
        return false;
      }
      
      // Create credential
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      
      // Reauthenticate
      await reauthenticateWithCredential(user, credential);
      
      // Change password
      await updatePassword(user, newPassword);
      
      console.log("Password updated successfully");
      return true;
    } catch (error) {
      console.error("Error changing password:", error);
      return false;
    }
  };

  const value = {
    user,
    isAdmin,
    isApproved,
    isAuthenticated,
    loading,
    appSettings,
    signUp,
    signIn,
    signOut,
    updateUser,
    resetPassword,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
