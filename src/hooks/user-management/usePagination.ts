
import { useCallback } from 'react';

interface UsePaginationProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  fetchUsers: (isNextPage?: boolean, isPrevPage?: boolean, forceRefresh?: boolean) => Promise<void>;
}

export const usePagination = ({
  currentPage,
  setCurrentPage,
  fetchUsers
}: UsePaginationProps) => {
  // Refresh users list
  const refreshUsersList = useCallback(() => {
    console.log("Refreshing users list");
    fetchUsers(false, false, true);
  }, [fetchUsers]);

  // Go to next page
  const nextPage = useCallback(() => {
    console.log("Moving to next page from", currentPage);
    setCurrentPage(currentPage + 1);
    fetchUsers(true, false, false);
  }, [currentPage, setCurrentPage, fetchUsers]);

  // Go to previous page
  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      console.log("Moving to previous page from", currentPage);
      setCurrentPage(currentPage - 1);
      fetchUsers(false, true, false);
    }
  }, [currentPage, setCurrentPage, fetchUsers]);

  return {
    refreshUsersList,
    nextPage,
    prevPage
  };
};
