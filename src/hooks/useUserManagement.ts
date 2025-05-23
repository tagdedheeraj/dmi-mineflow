
import { useCallback, useEffect } from 'react';
import { useUsersFetching } from './user-management/useUsersFetching';
import { useUserDeletion } from './user-management/useUserDeletion';
import { usePagination } from './user-management/usePagination';
import { useUserSearch } from './user-management/useUserSearch';
import { useUserExport } from './user-management/useUserExport';
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
    newUsersCount,
    viewingNewUsersOnly,
    setSearchTerm,
    setCurrentPage,
    fetchUsers,
    fetchNewUsersOnly,
    fetchAllUsers
  } = useUsersFetching();

  // Load users when component mounts
  useEffect(() => {
    fetchUsers(false, false, true);
  }, []);

  // Handle user deleted from the list
  const handleUserDeleted = useCallback((userId: string) => {
    // We don't need to manually update the users array here
    // Just refresh the list to get the latest data
    if (viewingNewUsersOnly) {
      fetchNewUsersOnly();
    } else {
      fetchUsers(false, false, true);
    }
  }, [fetchUsers, fetchNewUsersOnly, viewingNewUsersOnly]);

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

  // User export functionality
  const {
    exportUserEmails,
    exportNewUserEmails
  } = useUserExport({
    users
  });

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
    newUsersCount,
    viewingNewUsersOnly,
    handleSearch,
    refreshUsersList,
    nextPage,
    prevPage,
    goToPage,
    setUserToDelete,
    handleDeleteUser,
    exportUserEmails,
    exportNewUserEmails,
    fetchNewUsersOnly,
    fetchAllUsers,
  };
};
