
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, collection, getDocs, query, where, limit, startAfter, orderBy } from 'firebase/firestore';
import { db, deleteUserAccount } from '@/lib/firebase';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

const UserManagement: React.FC = () => {
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

  // More efficient fetch users function
  const fetchUsers = async (isNextPage = false, isPrevPage = false) => {
    setIsLoading(true);
    try {
      const usersCollection = collection(db, 'users');
      let userQuery;
      
      // If searching, use client-side filtering
      if (searchTerm.trim() !== "") {
        userQuery = query(usersCollection, orderBy('fullName'), limit(100));
      } else {
        // Otherwise use server-side pagination
        if (isNextPage && lastVisible) {
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
      const lastVisibleDoc = userSnapshot.docs[userSnapshot.docs.length - 1];
      if (lastVisibleDoc) {
        setLastVisible(lastVisibleDoc);
      }
      
      // Get total count on first load
      if (!isNextPage && !isPrevPage && !searchTerm) {
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

  // Fetch users on initial load and when search/pagination changes
  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  // Add a refresh function that can be manually triggered
  const refreshUsersList = () => {
    setCurrentPage(1);
    setLastVisible(null);
    setIsFirstPage(true);
    fetchUsers();
  };

  // Format plans for display
  const formatPlans = (plans?: UserPlan[]): string => {
    if (!plans || plans.length === 0) return "No active plans";
    return plans.map(p => `${p.planId} (${p.boostMultiplier}x, expires: ${p.expiresAt})`).join(", ");
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
  
  // Handle user deletion
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

  // Function to fetch additional user details when needed (e.g., on demand)
  const fetchUserDetails = async (userId: string) => {
    try {
      // Implementation can be added later if needed for showing detailed user info
      console.log("Fetching details for user:", userId);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  // Calculate total pages based on user count
  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm mb-8">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full"
            />
          </div>
          <Button 
            onClick={refreshUsersList} 
            variant="outline"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-dmi"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>DMI Coins</TableHead>
                  <TableHead>USDT</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.balance.toFixed(2)}</TableCell>
                    <TableCell>${user.usdtEarnings?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setUserToDelete(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Pagination controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing page {currentPage} of {totalPages || 1}
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={prevPage}
                  disabled={isFirstPage || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={nextPage}
                  disabled={filteredUsers.length < USERS_PER_PAGE || isLoading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm User Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete user "{userToDelete?.fullName}"? 
              This action cannot be undone and will remove all of the user's 
              data, including mining history, plans, and transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default UserManagement;
