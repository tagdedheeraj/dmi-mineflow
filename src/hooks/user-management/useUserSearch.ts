
import { useCallback } from 'react';

interface UserSearchProps {
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  refreshUsersList: () => void; // Add refreshUsersList
}

export const useUserSearch = ({
  setSearchTerm,
  setCurrentPage,
  refreshUsersList // Include refreshUsersList to search results
}: UserSearchProps) => {
  // Handle search
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Search term changed to:", e.target.value);
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
    
    // If search term is cleared, refresh the list to show all users
    if (e.target.value === '') {
      console.log("Search term cleared, refreshing user list");
      refreshUsersList();
    }
  }, [setSearchTerm, setCurrentPage, refreshUsersList]);

  return {
    handleSearch
  };
};
