
import { useCallback } from 'react';
import { useUsersFetching, UserData } from './user-management/useUsersFetching';
import { useUserDeletion } from './user-management/useUserDeletion';
import { usePagination } from './user-management/usePagination';
import { useUserSearch } from './user-management/useUserSearch';

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
  };
};
