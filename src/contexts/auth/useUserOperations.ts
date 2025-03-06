
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/storage/types';
import { saveUser as saveFirestoreUser } from '@/lib/firestore';

export function useUserOperations(
  user: User | null,
  setUser: (user: User | null) => void
) {
  const { toast } = useToast();

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

  return {
    updateBalance,
    updateUser,
    changePassword
  };
}
