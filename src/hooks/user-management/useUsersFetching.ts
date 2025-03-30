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
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [isFirstPage, setIsFirstPage] = useState(true);

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
      
      if (userSnapshot.docs.length > 0) {
        const lastVisibleDoc = userSnapshot.docs[userSnapshot.docs.length - 1];
        setLastVisible(lastVisibleDoc);
        console.log("Set lastVisible to:", lastVisibleDoc.id);
      }
      
      if ((!isNextPage && !isPrevPage && !searchTerm) || forceRefresh) {
        const count = await getUsersCount();
        setTotalUsers(count);
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
        const isNew = (Date.now() - createdAt) < (24 * 60 * 60 * 1000);
        
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
        console.log("Filtered users emails:", filtered.map(u => u.email));
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
    console.log("useEffect triggered for fetchUsers");
    fetchUsers();
  }, [currentPage]);

  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);
  
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
