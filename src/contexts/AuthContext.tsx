
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, saveUser, clearUser, User } from '@/lib/storage';
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
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize auth state from local storage
  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const signUp = async (fullName: string, email: string, password: string) => {
    try {
      // In a real app, you would make an API call here
      // For this demo, we'll create a user locally
      const userId = `user_${Date.now()}`;
      const newUser: User = {
        id: userId,
        fullName,
        email,
        balance: 100, // Bonus 100 DMI coins for new users
        createdAt: Date.now(),
      };
      
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
      // In a real app, you would verify credentials with an API
      // For this demo, we'll check if the user exists locally (by email)
      const storedUser = getUser();
      
      if (storedUser && storedUser.email === email) {
        // Successful login
        setUser(storedUser);
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
    // Do not clear mining data on logout - mining should continue
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
