
import { useCallback } from 'react';

interface UserSearchProps {
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
}

export const useUserSearch = ({
  setSearchTerm,
  setCurrentPage
}: UserSearchProps) => {
  // Handle search
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Search term changed to:", e.target.value);
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  }, [setSearchTerm, setCurrentPage]);

  return {
    handleSearch
  };
};
