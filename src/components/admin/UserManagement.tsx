
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
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
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
  const usersPerPage = 10;

  // Fetch all users
  const fetchAllUsers = async () => {
    setIsLoading(true);
    try {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      
      const usersData: UserData[] = [];
      
      for (const userDoc of userSnapshot.docs) {
        const userData = userDoc.data();
        
        // Fetch referral count
        let referralCount = 0;
        try {
          const referralsRef = collection(db, 'referrals');
          const referralsSnapshot = await getDocs(referralsRef);
          referralCount = referralsSnapshot.docs.filter(
            doc => doc.data().referrerId === userDoc.id && doc.data().level === 1
          ).length;
        } catch (err) {
          console.error("Error fetching referrals:", err);
        }
        
        // Fetch active plans
        let activePlans: UserPlan[] = [];
        try {
          const plansRef = collection(db, 'active_plans');
          const plansSnapshot = await getDocs(plansRef);
          const now = new Date();
          
          activePlans = plansSnapshot.docs
            .filter(doc => doc.data().userId === userDoc.id)
            .map(doc => {
              const plan = doc.data();
              return {
                planId: plan.planId,
                expiresAt: new Date(plan.expiresAt).toLocaleDateString(),
                boostMultiplier: plan.boostMultiplier
              };
            })
            .filter(plan => new Date(plan.expiresAt) > now);
        } catch (err) {
          console.error("Error fetching plans:", err);
        }
        
        usersData.push({
          id: userDoc.id,
          fullName: userData.fullName || 'Unknown',
          email: userData.email || 'Unknown',
          balance: userData.balance || 0,
          usdtEarnings: userData.usdtEarnings || 0,
          referralCount,
          activePlans: activePlans.length > 0 ? activePlans : undefined
        });
      }
      
      setUsers(usersData);
      setFilteredUsers(usersData);
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
    fetchAllUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = users.filter(
        user => 
          user.fullName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Format plans for display
  const formatPlans = (plans?: UserPlan[]): string => {
    if (!plans || plans.length === 0) return "No active plans";
    return plans.map(p => `${p.planId} (${p.boostMultiplier}x, expires: ${p.expiresAt})`).join(", ");
  };

  // Calculate pagination values
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Pagination handlers
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Button 
            onClick={fetchAllUsers} 
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
                  <TableHead>Referrals</TableHead>
                  <TableHead>Active Plans</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.balance.toFixed(2)}</TableCell>
                    <TableCell>${user.usdtEarnings?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell>{user.referralCount || 0}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {formatPlans(user.activePlans)}
                    </TableCell>
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
                Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={nextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
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
