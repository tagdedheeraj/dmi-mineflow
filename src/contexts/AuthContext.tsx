
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getUser, 
  saveUser, 
  clearUser,
  getDeviceId,
  registerAccountOnDevice,
  updateUser as updateStorageUser
} from '@/lib/storage';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';

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

  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      if (storedUser.suspended) {
        toast({
          title: "Account Suspended",
          description: storedUser.suspendedReason || "This account has been suspended.",
          variant: "destructive",
        });
        clearUser();
        setUser(null);
      } else {
        setUser(storedUser);
      }
    }
    setLoading(false);
  }, [toast]);

  const signUp = async (fullName: string, email: string, password: string) => {
    try {
      const userId = `user_${Date.now()}`;
      const deviceId = getDeviceId();
      
      const { isMultipleAccount, within24Hours } = registerAccountOnDevice(userId);
      
      const newUser: User = {
        id: userId,
        fullName,
        email,
        balance: 100,
        createdAt: Date.now(),
        deviceId,
        suspended: isMultipleAccount && within24Hours,
        suspendedReason: isMultipleAccount && within24Hours 
          ? "Multiple accounts created from the same device within 24 hours."
          : undefined
      };
      
      if (newUser.suspended) {
        toast({
          title: "Account Suspended",
          description: "You cannot create more than one account from the same device within 24 hours.",
          variant: "destructive",
        });
        navigate('/signin');
        return;
      }
      
      setUser(newUser);
      saveUser(newUser);
      
      toast({
        title: "Welcome to DMI Mining!",
        description: "You've received 100 DMI Coins as a welcome bonus.",
      });
      
      navigate('/mining');
    } catch (error) {
      toast({
        title: "Sign Up Failed",
        description: "An error occurred during sign up.",
        variant: "destructive",
      });
      console.error("Sign up error:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const storedUser = getUser();
      
      if (storedUser && storedUser.email === email) {
        if (storedUser.suspended) {
          toast({
            title: "Account Suspended",
            description: storedUser.suspendedReason || "This account has been suspended.",
            variant: "destructive",
          });
          return;
        }
        
        const deviceId = getDeviceId();
        const updatedUser = {
          ...storedUser,
          deviceId
        };
        saveUser(updatedUser);
        
        setUser(updatedUser);
        navigate('/mining');
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
      } else {
        toast({
          title: "Sign In Failed",
          description: "Invalid email or password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: "An error occurred during sign in.",
        variant: "destructive",
      });
      console.error("Sign in error:", error);
    }
  };

  const signOut = () => {
    setUser(null);
    navigate('/signin');
    toast({
      title: "Signed Out",
      description: "You've been successfully signed out.",
    });
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
    } catch (error) {
      toast({
        title: "Password Change Failed",
        description: "An error occurred while changing your password.",
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
