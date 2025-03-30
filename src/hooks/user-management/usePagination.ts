
import { useCallback } from 'react';

interface UsePaginationProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  fetchUsers: (isNextPage?: boolean, isPrevPage?: boolean, forceRefresh?: boolean) => Promise<void>;
  totalPages: number;
}

export const usePagination = ({
  currentPage,
  setCurrentPage,
  fetchUsers,
  totalPages
}: UsePaginationProps) => {
  // Refresh users list
  const refreshUsersList = useCallback(() => {
    console.log("Refreshing users list");
    fetchUsers(false, false, true);
  }, [fetchUsers]);

  // Go to next page
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      console.log("Moving to next page from", currentPage);
      setCurrentPage(currentPage + 1);
      fetchUsers(true, false, false);
    }
  }, [currentPage, setCurrentPage, fetchUsers, totalPages]);

  // Go to previous page
  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      console.log("Moving to previous page from", currentPage);
      setCurrentPage(currentPage - 1);
      fetchUsers(false, true, false);
    }
  }, [currentPage, setCurrentPage, fetchUsers]);

  // Go to specific page
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      console.log("Going to page", page, "from", currentPage);
      setCurrentPage(page);
      fetchUsers(page > currentPage, page < currentPage, false);
    }
  }, [currentPage, setCurrentPage, fetchUsers, totalPages]);

  return {
    refreshUsersList,
    nextPage,
    prevPage,
    goToPage
  };
};
