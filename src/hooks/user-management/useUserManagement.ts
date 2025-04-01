
import { useCallback } from 'react';
import { useUsersFetching } from './useUsersFetching';
import { useUserDeletion } from './useUserDeletion';
import { usePagination } from './usePagination';
import { useUserSearch } from './useUserSearch';
import { useUserExport } from './useUserExport';

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

  // Search hook
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
