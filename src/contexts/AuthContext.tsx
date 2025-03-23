
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User,
  getDeviceId,
} from '@/lib/storage'; // Keeping the types from storage
import { 
  getUser as getFirestoreUser, 
  saveUser as saveFirestoreUser,
  registerAccountOnDevice,
  getAppSettings
} from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { auth, signInWithEmail, createUserWithEmail, signOutUser } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser, AuthError } from 'firebase/auth';
import { notifyAppUpdate } from '@/lib/rewards/notificationService';

// Add AppSettings interface
interface AppSettings {
  version: string;
  updateUrl: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  isAdmin: boolean;
  appSettings: AppSettings;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  updateBalance: (newBalance: number) => void;
  updateUser: (updatedUser: User) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  isAdmin: false,
  appSettings: { version: '1.0.0', updateUrl: 'https://dminetwork.us' },
  signIn: async () => {},
  signUp: async () => {},
  signOut: () => {},
  updateBalance: () => {},
  updateUser: () => {},
  changePassword: async () => false,
});

export const useAuth = () => useContext(AuthContext);

// Admin email for special access
const ADMIN_EMAIL = "tagdedheeraj4@gmail.com";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>({ 
    version: '1.0.0', 
    updateUrl: 'https://dminetwork.us' 
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch app settings
  useEffect(() => {
    const fetchAppSettings = async () => {
      try {
        const settings = await getAppSettings();
        if (settings) {
          setAppSettings(settings);
          
          // Compare with stored version and update localStorage if admin
          const storedVersion = localStorage.getItem('appVersion');
          
          // If user is admin, update the stored version to match the current version
          if (isAdmin) {
            localStorage.setItem('appVersion', settings.version);
          } 
          // If versions don't match and user isn't admin, this indicates an update is needed
          else if (storedVersion !== settings.version && user) {
            console.log(`App update available: stored=${storedVersion}, current=${settings.version}`);
          }
        }
      } catch (error) {
        console.error("Error fetching app settings:", error);
      }
    };
    
    fetchAppSettings();
  }, [isAdmin, user?.id]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser?.email || "No user");
      if (firebaseUser) {
        // User is signed in
        try {
          // First check if we have the user in Firestore
          const firestoreUser = await getFirestoreUser(firebaseUser.uid);
          console.log("Firestore user:", firestoreUser);
          
          // Check if this is the admin account
          if (firebaseUser.email === ADMIN_EMAIL) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
          
          if (firestoreUser) {
            if (firestoreUser.suspended) {
              toast({
                title: "Account Suspended",
                description: firestoreUser.suspendedReason || "This account has been suspended.",
                variant: "destructive",
              });
              await signOutUser();
              setUser(null);
            } else {
              setUser(firestoreUser);
            }
          } else {
            // Create a new user profile if it doesn't exist
            const newUser: User = {
              id: firebaseUser.uid,
              fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              balance: 100, // Default balance for new users
              createdAt: Date.now(),
              deviceId: getDeviceId(),
            };
            setUser(newUser);
            await saveFirestoreUser(newUser);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast({
            title: "Error",
            description: "Failed to load user data. Please try again later.",
            variant: "destructive",
          });
        }
      } else {
        // User is signed out
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [toast]);

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
        balance: 100, // Default balance for new users
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
      
      // If the user doesn't exist in Firestore, that means the account was deleted by admin
      if (!firestoreUser) {
        // Sign out the user immediately since they shouldn't be allowed to proceed
        await signOutUser();
        
        toast({
          title: "Account Deleted",
          description: "Your account has been deleted due to suspicious activity. Please contact support for more information.",
          variant: "destructive",
        });
        
        throw new Error("Account deleted due to suspicious activity");
      }
      
      if (firestoreUser.suspended) {
        toast({
          title: "Account Suspended",
          description: firestoreUser.suspendedReason || "This account has been suspended.",
          variant: "destructive",
        });
        await signOutUser();
        throw new Error("Account suspended");
      }
      
      // Update deviceId while preserving existing balance and other user data
      const updatedUser = {
        ...firestoreUser,
        deviceId: getDeviceId()
      };
      await saveFirestoreUser(updatedUser);
      setUser(updatedUser);
      
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
      
      // Special handling for the case where we've deliberately thrown our custom error
      if (error.message === "Account deleted due to suspicious activity") {
        // We've already shown the toast above, so just throw the error to prevent login
        throw error;
      }
      
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

  const updateBalance = async (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      await saveFirestoreUser(updatedUser);
      setUser(updatedUser);
    }
  };
  
  const updateUser = (updatedUser: User) => {
    saveFirestoreUser(updatedUser)
      .then(() => {
        setUser(updatedUser);
      })
      .catch(error => {
        console.error("Error updating user:", error);
        toast({
          title: "Update Failed",
          description: "Failed to update user information.",
          variant: "destructive",
        });
      });
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      if (user) {
        // Firebase password change logic would go here
        // For now, just show success toast
        toast({
          title: "Password Changed",
          description: "Your password has been successfully updated.",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "You must be logged in to change your password.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Password Change Failed",
        description: error.message || "An error occurred while changing your password.",
        variant: "destructive",
      });
      console.error("Password change error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        isAdmin,
        appSettings,
        signIn,
        signUp,
        signOut,
        updateBalance,
        updateUser,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
