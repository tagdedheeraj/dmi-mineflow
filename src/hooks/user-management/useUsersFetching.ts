
import { useState, useEffect } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { createUserQuery, getUsersCount, USERS_PER_PAGE } from './userFirestoreQueries';

export type UserPlan = {
  planId: string;
  expiresAt: string;
  boostMultiplier: number;
};

export type UserData = {
  id: string;
  fullName: string;
  email: string;
  balance: number;
  usdtEarnings: number;
  referralCount?: number;
  activePlans?: UserPlan[];
};

export const useUsersFetching = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [isFirstPage, setIsFirstPage] = useState(true);

  // Fetch users function
  const fetchUsers = async (isNextPage = false, isPrevPage = false, forceRefresh = false) => {
    setIsLoading(true);
    try {
      const userQuery = createUserQuery(
        searchTerm,
        lastVisible,
        isNextPage,
        isPrevPage,
        currentPage,
        forceRefresh
      );
      
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
        const count = await getUsersCount();
        setTotalUsers(count);
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
    setSearchTerm,
    setCurrentPage,
    fetchUsers,
  };
};
