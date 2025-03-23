
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  limit, 
  startAfter, 
  orderBy,
  documentId
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
      console.log("Fetching users with params:", { isNextPage, isPrevPage, forceRefresh, searchTerm });
      const usersCollection = collection(db, 'users');
      let userQuery;
      
      // If searching, don't use pagination but still get all results
      if (searchTerm.trim() !== "") {
        userQuery = query(usersCollection, orderBy('fullName'), limit(100));
        console.log("Search query created for term:", searchTerm);
      } else {
        // Reset lastVisible when forcing a refresh
        if (forceRefresh) {
          console.log("Force refreshing users list");
          setLastVisible(null);
          userQuery = query(
            usersCollection,
            orderBy('fullName'),
            limit(USERS_PER_PAGE)
          );
        }
        // Otherwise use server-side pagination
        else if (isNextPage && lastVisible) {
          console.log("Moving to next page with lastVisible:", lastVisible.id);
          userQuery = query(
            usersCollection, 
            orderBy('fullName'),
            startAfter(lastVisible),
            limit(USERS_PER_PAGE)
          );
        } else if (isPrevPage) {
          console.log("Moving to previous page:", currentPage - 1);
          // For previous page, we'll fetch the current page - 1
          userQuery = query(
            usersCollection,
            orderBy('fullName'),
            limit(USERS_PER_PAGE * (currentPage - 1))
          );
        } else {
          console.log("Fetching first page or current page:", currentPage);
          // First page
          userQuery = query(
            usersCollection,
            orderBy('fullName'),
            limit(USERS_PER_PAGE)
          );
        }
      }
      
      console.log("Executing Firestore query...");
      const userSnapshot = await getDocs(userQuery);
      console.log(`Query returned ${userSnapshot.docs.length} users`);
      
      // Update pagination trackers
      if (userSnapshot.docs.length > 0) {
        const lastVisibleDoc = userSnapshot.docs[userSnapshot.docs.length - 1];
        setLastVisible(lastVisibleDoc);
        console.log("Set lastVisible to:", lastVisibleDoc.id);
      }
      
      // Get total count on first load or refresh
      if ((!isNextPage && !isPrevPage && !searchTerm) || forceRefresh) {
        console.log("Getting total user count");
        // Get total count more efficiently (may need a counter collection in a production app)
        const countSnapshot = await getDocs(query(collection(db, 'users')));
        setTotalUsers(countSnapshot.size);
        console.log("Total users count:", countSnapshot.size);
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
      
      console.log("Processed user data:", usersData.length, "users");
      setUsers(usersData);
      
      // If searching, filter client-side
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const filtered = usersData.filter(
          user => 
            user.fullName.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term)
        );
        console.log("Filtered users by search term:", filtered.length, "results");
        setFilteredUsers(filtered);
      } else {
        console.log("No search term, setting filtered users to all users");
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
    console.log("useEffect triggered for fetchUsers");
    fetchUsers();
  }, [currentPage, searchTerm]);

  // Refresh function
  const refreshUsersList = () => {
    console.log("Manual refresh triggered");
    setCurrentPage(1);
    setLastVisible(null);
    setIsFirstPage(true);
    fetchUsers(false, false, true);
  };

  // Pagination handlers
  const nextPage = () => {
    console.log("Moving to next page from", currentPage);
    setCurrentPage(currentPage + 1);
    fetchUsers(true, false);
  };

  const prevPage = () => {
    if (currentPage > 1) {
      console.log("Moving to previous page from", currentPage);
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
    console.log("Search term changed to:", e.target.value);
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
