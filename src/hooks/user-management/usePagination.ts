
import { useCallback } from 'react';

interface PaginationProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  fetchUsers: (isNextPage?: boolean, isPrevPage?: boolean, forceRefresh?: boolean) => Promise<void>;
}

export const usePagination = ({
  currentPage,
  setCurrentPage,
  fetchUsers
}: PaginationProps) => {
  // Refresh function
  const refreshUsersList = useCallback(() => {
    console.log("Manual refresh triggered");
    setCurrentPage(1);
    fetchUsers(false, false, true);
  }, [fetchUsers, setCurrentPage]);

  // Pagination handlers
  const nextPage = useCallback(() => {
    console.log("Moving to next page from", currentPage);
    setCurrentPage(currentPage + 1);
    fetchUsers(true, false);
  }, [currentPage, fetchUsers, setCurrentPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      console.log("Moving to previous page from", currentPage);
      setCurrentPage(currentPage - 1);
      fetchUsers(false, true);
    }
  }, [currentPage, fetchUsers, setCurrentPage]);

  return {
    refreshUsersList,
    nextPage,
    prevPage
  };
};
