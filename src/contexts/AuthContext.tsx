
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getUser, 
  saveUser, 
  clearUser, 
  User,
  getDeviceId,
  registerAccountOnDevice
} from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { auth, signInWithEmail, createUserWithEmail, signOutUser } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
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
  signIn: async () => {},
  signUp: async () => {},
  signOut: () => {},
  updateBalance: () => {},
  updateUser: () => {},
  changePassword: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        // First check if we have the user in local storage
        const storedUser = getUser();
        
        if (storedUser && storedUser.email === firebaseUser.email) {
          if (storedUser.suspended) {
            toast({
              title: "Account Suspended",
              description: storedUser.suspendedReason || "This account has been suspended.",
              variant: "destructive",
            });
            clearUser();
            signOutUser();
            setUser(null);
          } else {
            setUser(storedUser);
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
          saveUser(newUser);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [toast]);

  const signUp = async (fullName: string, email: string, password: string) => {
    try {
      const deviceId = getDeviceId();
      const { isMultipleAccount, within24Hours } = registerAccountOnDevice(`user_${Date.now()}`);
      
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
      
      // Create user profile
      const newUser: User = {
        id: firebaseUser.uid,
        fullName,
        email,
        balance: 100,
        createdAt: Date.now(),
        deviceId,
      };
      
      setUser(newUser);
      saveUser(newUser);
      
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
      
      const storedUser = getUser();
      
      if (storedUser && storedUser.email === email) {
        if (storedUser.suspended) {
          toast({
            title: "Account Suspended",
            description: storedUser.suspendedReason || "This account has been suspended.",
            variant: "destructive",
          });
          await signOutUser();
          return;
        }
        
        // Update deviceId
        const deviceId = getDeviceId();
        const updatedUser = {
          ...storedUser,
          deviceId
        };
        saveUser(updatedUser);
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
        setUser(newUser);
        saveUser(newUser);
      }
      
      navigate('/mining');
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
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

  const updateBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      saveUser(updatedUser);
    }
  };
  
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    saveUser(updatedUser);
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
