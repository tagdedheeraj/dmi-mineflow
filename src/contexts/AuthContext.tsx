
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getUser, 
  saveUser, 
  clearUser, 
  User,
  getDeviceId,
  registerAccountOnDevice
} from '@/lib/supabaseStorage';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
    const initializeAuth = async () => {
      const storedUser = await getUser();
      if (storedUser) {
        if (storedUser.suspended) {
          toast({
            title: "Account Suspended",
            description: storedUser.suspendedReason || "This account has been suspended.",
            variant: "destructive",
          });
          await clearUser();
          setUser(null);
        } else {
          setUser(storedUser);
        }
      }
      setLoading(false);
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const authUser = await getUser();
          setUser(authUser);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    initializeAuth();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const signUp = async (fullName: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      if (!data.user) {
        throw new Error('No user returned from sign up');
      }

      const userId = data.user.id;
      const deviceId = await getDeviceId();
      
      const { isMultipleAccount, within24Hours } = await registerAccountOnDevice(userId);
      
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
        await supabase.auth.signOut();
        navigate('/signin');
        return;
      }
      
      await saveUser(newUser);
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      const storedUser = await getUser();
      
      if (storedUser) {
        if (storedUser.suspended) {
          toast({
            title: "Account Suspended",
            description: storedUser.suspendedReason || "This account has been suspended.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          return;
        }
        
        const deviceId = await getDeviceId();
        const updatedUser = {
          ...storedUser,
          deviceId
        };
        await saveUser(updatedUser);
        
        setUser(updatedUser);
        navigate('/mining');
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
      } else {
        toast({
          title: "Sign In Failed",
          description: "User data not found.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message || "An error occurred during sign in.",
        variant: "destructive",
      });
      console.error("Sign in error:", error);
    }
  };

  const signOut = async () => {
    await clearUser();
    setUser(null);
    navigate('/signin');
    toast({
      title: "Signed Out",
      description: "You've been successfully signed out.",
    });
  };

  const updateBalance = async (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      await saveUser(updatedUser);
      setUser(updatedUser);
    }
  };
  
  const updateUser = async (updatedUser: User) => {
    await saveUser(updatedUser);
    setUser(updatedUser);
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      });
      return true;
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
