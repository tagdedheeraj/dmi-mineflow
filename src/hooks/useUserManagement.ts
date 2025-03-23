import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  limit, 
  startAfter, 
  orderBy 
} from 'firebase/firestore';
import { db, deleteUserAccount } from '@/lib/firebase';

type UserPlan = {
  planId: string;
  expiresAt: string;
  boostMultiplier: number;
};

type UserData = {
  id: string;
  fullName: string;
  email: string;
  balance: number;
  usdtEarnings: number;
  referralCount?: number;
  activePlans?: UserPlan[];
};

const USERS_PER_PAGE = 10;

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  // Deletion state
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [isFirstPage, setIsFirstPage] = useState(true);

  // Fetch users function
  const fetchUsers = async (isNextPage = false, isPrevPage = false, forceRefresh = false) => {
    setIsLoading(true);
    try {
      const usersCollection = collection(db, 'users');
      let userQuery;
      
      // If searching, use client-side filtering
      if (searchTerm.trim() !== "") {
        userQuery = query(usersCollection, orderBy('fullName'), limit(100));
      } else {
        // Reset lastVisible when forcing a refresh
        if (forceRefresh) {
          setLastVisible(null);
          userQuery = query(
            usersCollection,
            orderBy('fullName'),
            limit(USERS_PER_PAGE)
          );
        }
        // Otherwise use server-side pagination
        else if (isNextPage && lastVisible) {
          userQuery = query(
            usersCollection, 
            orderBy('fullName'),
            startAfter(lastVisible),
            limit(USERS_PER_PAGE)
          );
        } else if (isPrevPage) {
          // For previous page, we'll fetch the current page - 1
          userQuery = query(
            usersCollection,
            orderBy('fullName'),
            limit(USERS_PER_PAGE * (currentPage - 1))
          );
        } else {
          // First page
          userQuery = query(
            usersCollection,
            orderBy('fullName'),
            limit(USERS_PER_PAGE)
          );
        }
      }
      
      const userSnapshot = await getDocs(userQuery);
      
      // Update pagination trackers
      if (userSnapshot.docs.length > 0) {
        const lastVisibleDoc = userSnapshot.docs[userSnapshot.docs.length - 1];
        setLastVisible(lastVisibleDoc);
      }
      
      // Get total count on first load or refresh
      if ((!isNextPage && !isPrevPage && !searchTerm) || forceRefresh) {
        // Get total count more efficiently (may need a counter collection in a production app)
        const countSnapshot = await getDocs(query(collection(db, 'users')));
        setTotalUsers(countSnapshot.size);
      }
      
      // Get basic user data (avoid nested queries while loading the page)
      const usersData: UserData[] = userSnapshot.docs.map(doc => {
        const data = doc.data() as {
          fullName?: string;
          email?: string; 
          balance?: number;
          usdtEarnings?: number;
        };
        
        return {
          id: doc.id,
          fullName: data.fullName || 'Unknown',
          email: data.email || 'Unknown',
          balance: data.balance || 0,
          usdtEarnings: data.usdtEarnings || 0,
          referralCount: 0, // Will be populated on demand
          activePlans: [] // Will be populated on demand
        };
      });
      
      setUsers(usersData);
      
      // If searching, filter client-side
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const filtered = usersData.filter(
          user => 
            user.fullName.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term)
        );
        setFilteredUsers(filtered);
      } else {
        setFilteredUsers(usersData);
      }
      
      // Set first page flag
      setIsFirstPage(currentPage === 1);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  // Refresh function
  const refreshUsersList = () => {
    setCurrentPage(1);
    setLastVisible(null);
    setIsFirstPage(true);
    fetchUsers(false, false, true);
  };

  // Pagination handlers
  const nextPage = () => {
    setCurrentPage(currentPage + 1);
    fetchUsers(true, false);
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      fetchUsers(false, true);
    }
  };
  
  // Delete user handler
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteUserAccount(userToDelete.id);
      
      if (success) {
        // Remove the user from the local state
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete.id));
        setFilteredUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete.id));
        
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

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);
  
  // Check if there are more pages
  const hasMorePages = filteredUsers.length === USERS_PER_PAGE;

  return {
    users: filteredUsers,
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
    setUserToDelete,
    handleDeleteUser,
  };
};
