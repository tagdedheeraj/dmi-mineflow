
import { useCallback, useEffect } from 'react';
import { useUsersFetching, UserData } from './user-management/useUsersFetching';
import { useUserDeletion } from './user-management/useUserDeletion';
import { usePagination } from './user-management/usePagination';
import { useUserSearch } from './user-management/useUserSearch';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export const useUserManagement = () => {
  // Use the user fetching hook
  const {
    users,
    isLoading,
    searchTerm,
    currentPage,
    totalPages,
    isFirstPage,
    hasMorePages,
    setSearchTerm,
    setCurrentPage,
    fetchUsers
  } = useUsersFetching();

  const { toast } = useToast();

  // Force refresh on initial load
  useEffect(() => {
    // Initial data fetch when the component mounts
    fetchUsers(false, false, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle user deleted from the list
  const handleUserDeleted = useCallback((userId: string) => {
    // We don't need to manually update the users array here
    // Just refresh the list to get the latest data
    fetchUsers(false, false, true);
  }, [fetchUsers]);

  // User deletion hook
  const {
    userToDelete,
    isDeleting,
    setUserToDelete,
    handleDeleteUser
  } = useUserDeletion(handleUserDeleted);

  // Pagination hook
  const {
    refreshUsersList,
    nextPage,
    prevPage,
    goToPage
  } = usePagination({
    currentPage,
    setCurrentPage,
    fetchUsers,
    totalPages
  });

  // Search hook - pass refreshUsersList to search hook
  const {
    handleSearch
  } = useUserSearch({
    setSearchTerm,
    setCurrentPage,
    refreshUsersList
  });

  // Export all user emails to a CSV file
  const exportUserEmails = useCallback(async () => {
    try {
      toast({
        title: "Starting export...",
        description: "Fetching all user emails",
      });

      // Fetch all users from Firestore
      const usersCollection = collection(db, 'users');
      const querySnapshot = await getDocs(usersCollection);
      
      if (querySnapshot.empty) {
        toast({
          title: "No users found",
          description: "There are no users to export",
          variant: "destructive",
        });
        return;
      }
      
      // Extract emails from the user data
      const emails = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return data.email || 'No email';
        })
        .filter(email => email !== 'No email' && email !== '');
      
      // Create CSV content
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Email Address\n" + 
        emails.join("\n");
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `user_emails_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export complete",
        description: `Successfully exported ${emails.length} user emails`,
      });
    } catch (error) {
      console.error("Error exporting user emails:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting user emails",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    users,
    isLoading,
    searchTerm,
    currentPage,
    totalPages,
    isFirstPage,
    hasMorePages,
    userToDelete,
    isDeleting,
    handleSearch,
    refreshUsersList,
    nextPage,
    prevPage,
    goToPage,
    setUserToDelete,
    handleDeleteUser,
    exportUserEmails,
  };
};
