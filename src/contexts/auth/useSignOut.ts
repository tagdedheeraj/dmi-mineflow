
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { signOutUser } from '@/lib/firebase';
import { User } from '@/lib/storage/types';

export function useSignOut(
  setUser: (user: User | null) => void,
  setIsAdmin: (isAdmin: boolean) => void
) {
  const navigate = useNavigate();
  const { toast } = useToast();

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

  return { signOut };
}
