
import { useState, useEffect } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { createUserQuery, getUsersCount, getNewUsersCount, USERS_PER_PAGE, NEW_USER_WINDOW } from './userFirestoreQueries';

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
  createdAt?: number;
  isNew?: boolean;
};

export const useUsersFetching = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [newUsersCount, setNewUsersCount] = useState(0);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [isFirstPage, setIsFirstPage] = useState(true);
  const [viewingNewUsersOnly, setViewingNewUsersOnly] = useState(false);

  const fetchUsers = async (isNextPage = false, isPrevPage = false, forceRefresh = false, newUsersOnly = false) => {
    setIsLoading(true);
    try {
      // Save the current view mode
      setViewingNewUsersOnly(newUsersOnly);
      
      const userQuery = createUserQuery(
        searchTerm,
        lastVisible,
        isNextPage,
        isPrevPage,
        currentPage,
        forceRefresh,
        newUsersOnly
      );
      
      console.log(`Executing Firestore query for ${newUsersOnly ? 'new' : 'all'} users...`);
      const userSnapshot = await getDocs(userQuery);
      console.log(`Query returned ${userSnapshot.docs.length} users`);
      
      if (userSnapshot.docs.length > 0) {
        const lastVisibleDoc = userSnapshot.docs[userSnapshot.docs.length - 1];
        setLastVisible(lastVisibleDoc);
        console.log("Set lastVisible to:", lastVisibleDoc.id);
      }
      
      if ((!isNextPage && !isPrevPage && !searchTerm) || forceRefresh) {
        // Update counts
        const count = await getUsersCount();
        setTotalUsers(count);
        
        // Also update new users count
        const newCount = await getNewUsersCount();
        setNewUsersCount(newCount);
        console.log("Updated new users count:", newCount);
      }
      
      const usersData: UserData[] = userSnapshot.docs.map(doc => {
        const data = doc.data() as {
          fullName?: string;
          email?: string; 
          balance?: number;
          usdtEarnings?: number;
          createdAt?: number;
        };
        
        const createdAt = data.createdAt || Date.now();
        const isNew = (Date.now() - createdAt) < NEW_USER_WINDOW;
        
        return {
          id: doc.id,
          fullName: data.fullName || 'Unknown',
          email: data.email || 'Unknown',
          balance: data.balance || 0,
          usdtEarnings: data.usdtEarnings || 0,
          referralCount: 0,
          activePlans: [],
          createdAt: createdAt,
          isNew: isNew
        };
      });
      
      console.log("Processed user data:", usersData.length, "users");
      setUsers(usersData);
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const filtered = usersData.filter(
          user => 
            (user.fullName && user.fullName.toLowerCase().includes(term)) ||
            (user.email && user.email.toLowerCase().includes(term))
        );
        console.log("Filtered users by search term:", filtered.length, "results");
        setFilteredUsers(filtered);
      } else {
        console.log("No search term, setting filtered users to all users");
        setFilteredUsers(usersData);
      }
      
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

  useEffect(() => {
    console.log("useEffect triggered for fetchUsers with currentPage:", currentPage);
    fetchUsers(false, false, false, viewingNewUsersOnly);
  }, [currentPage]);

  const fetchNewUsersOnly = async () => {
    console.log("Fetching only new users");
    await fetchUsers(false, false, true, true);
  };

  const fetchAllUsers = async () => {
    console.log("Fetching all users");
    await fetchUsers(false, false, true, false);
  };

  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);
  
  const hasMorePages = currentPage < totalPages;

  return {
    users: filteredUsers,
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
    fetchAllUsers,
  };
};
