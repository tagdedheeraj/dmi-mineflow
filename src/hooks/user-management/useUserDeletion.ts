
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { deleteUserAccount } from '@/lib/firebase';
import { UserData } from './useUsersFetching';

export const useUserDeletion = (
  onUserDeleted: (userId: string) => void
) => {
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Delete user handler
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteUserAccount(userToDelete.id);
      
      if (success) {
        // Let parent know to update the users list
        onUserDeleted(userToDelete.id);
        
        toast({
          title: "User Deleted",
          description: `User account "${userToDelete.fullName}" has been successfully deleted.`,
        });
      } else {
        throw new Error("Failed to delete user account");
      }
    } catch (error) {
      console.error("Error during user deletion:", error);
      toast({
        title: "Deletion Failed",
        description: "There was an error deleting this user account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  return {
    userToDelete,
    isDeleting,
    setUserToDelete,
    handleDeleteUser,
  };
};
