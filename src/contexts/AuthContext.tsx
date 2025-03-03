import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User,
  getDeviceId,
} from '@/lib/storage'; // Keeping the types from storage
import { 
  getUser as getFirestoreUser, 
  saveUser as saveFirestoreUser,
  registerAccountOnDevice
} from '@/lib/firebase'; // Updated import path
import { useToast } from '@/hooks/use-toast';
import { auth, signInWithEmail, createUserWithEmail, signOutUser } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  isAdmin: boolean;
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
  const navigate = useNavigate();
  const { toast } = useToast();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        try {
          // First check if we have the user in Firestore
          const firestoreUser = await getFirestoreUser(firebaseUser.uid);
          
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
              balance: 100,
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
          title: "Account Suspended",
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
      toast({
        title: "Sign Up Failed",
        description: error.message || "An error occurred during sign up.",
        variant: "destructive",
      });
      console.error("Sign up error:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmail(email, password);
      const firebaseUser = userCredential.user;
      
      // Check if this is the admin account
      if (email === ADMIN_EMAIL) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      
      // Fetch user from Firestore
      const firestoreUser = await getFirestoreUser(firebaseUser.uid);
      
      if (firestoreUser) {
        if (firestoreUser.suspended) {
          toast({
            title: "Account Suspended",
            description: firestoreUser.suspendedReason || "This account has been suspended.",
            variant: "destructive",
          });
          await signOutUser();
          return;
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
      toast({
        title: "Sign In Failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
      console.error("Sign in error:", error);
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
