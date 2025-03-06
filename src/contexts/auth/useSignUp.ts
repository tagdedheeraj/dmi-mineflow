import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/storage/types';
import { 
  saveUser as saveFirestoreUser,
  registerAccountOnDevice 
} from '@/lib/firestore';
import { createUserWithEmail } from '@/lib/firebase';
import { getDeviceId } from '@/lib/firestore';

export function useSignUp(setUser: (user: User | null) => void) {
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

  return { signUp };
}
