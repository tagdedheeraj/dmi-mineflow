
import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User } from '@/lib/storage/types';
import { getUser as getFirestoreUser, saveUser as saveFirestoreUser } from '@/lib/firestore';
import { getDeviceId } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { useAuthOperations } from './useAuthOperations';
import { useUserOperations } from './useUserOperations';
import { AuthContextType, ADMIN_EMAIL } from './types';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  
  const {
    signIn,
    signUp,
    signOut,
    isLoading,
    setIsLoading
  } = useAuthOperations(setUser, setIsAdmin);
  
  const {
    updateBalance,
    updateUser,
    changePassword
  } = useUserOperations(user, setUser);

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
              await auth.signOut();
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
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [toast, setIsLoading]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading: isLoading,
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
