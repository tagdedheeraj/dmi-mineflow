
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, collection, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

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
  suspended?: boolean;
  suspendedReason?: string;
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  
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
          activePlans: activePlans.length > 0 ? activePlans : undefined,
          suspended: userData.suspended || false,
          suspendedReason: userData.suspendedReason
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

  // User account management functions
  const handleSuspendUser = async () => {
    if (!selectedUser || !suspensionReason.trim()) return;
    
    setIsActionLoading(true);
    try {
      const userRef = doc(db, 'users', selectedUser.id);
      await updateDoc(userRef, {
        suspended: true,
        suspendedReason: suspensionReason
      });
      
      toast({
        title: "User Suspended",
        description: `${selectedUser.fullName}'s account has been suspended.`,
      });
      
      // Update local state
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, suspended: true, suspendedReason } 
          : user
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      
      // Reset state
      setSelectedUser(null);
      setSuspensionReason("");
      setShowSuspendDialog(false);
    } catch (error) {
      console.error("Error suspending user:", error);
      toast({
        title: "Error",
        description: "Failed to suspend user account.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReactivateUser = async (user: UserData) => {
    setIsActionLoading(true);
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        suspended: false,
        suspendedReason: null
      });
      
      toast({
        title: "User Reactivated",
        description: `${user.fullName}'s account has been reactivated.`,
      });
      
      // Update local state
      const updatedUsers = users.map(u => 
        u.id === user.id 
          ? { ...u, suspended: false, suspendedReason: undefined } 
          : u
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    } catch (error) {
      console.error("Error reactivating user:", error);
      toast({
        title: "Error",
        description: "Failed to reactivate user account.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setIsActionLoading(true);
    try {
      const userRef = doc(db, 'users', selectedUser.id);
      await deleteDoc(userRef);
      
      toast({
        title: "User Deleted",
        description: `${selectedUser.fullName}'s account has been permanently deleted.`,
      });
      
      // Update local state
      const updatedUsers = users.filter(user => user.id !== selectedUser.id);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      
      // Reset state
      setSelectedUser(null);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user account.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
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
                  <TableHead>Status</TableHead>
                  <TableHead>Active Plans</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentUsers.map((user) => (
                  <TableRow key={user.id} className={user.suspended ? "bg-gray-50" : ""}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.balance.toFixed(2)}</TableCell>
                    <TableCell>${user.usdtEarnings?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell>{user.referralCount || 0}</TableCell>
                    <TableCell>
                      {user.suspended ? (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Suspended
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {formatPlans(user.activePlans)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.suspended ? (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-2 text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleReactivateUser(user)}
                            disabled={isActionLoading}
                          >
                            Reactivate
                          </Button>
                        ) : (
                          <Dialog open={showSuspendDialog && selectedUser?.id === user.id} onOpenChange={(open) => {
                            setShowSuspendDialog(open);
                            if (!open) setSelectedUser(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 px-2 text-amber-600 border-amber-200 hover:bg-amber-50"
                                onClick={() => setSelectedUser(user)}
                              >
                                Suspend
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Suspend User Account</DialogTitle>
                                <DialogDescription>
                                  This will prevent {selectedUser?.fullName} from accessing their account. 
                                  They will be logged out and unable to sign in.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <label className="block text-sm font-medium mb-2">
                                  Reason for suspension
                                </label>
                                <Textarea
                                  placeholder="Enter reason for suspension..."
                                  value={suspensionReason}
                                  onChange={(e) => setSuspensionReason(e.target.value)}
                                  rows={3}
                                  className="w-full"
                                />
                              </div>
                              <DialogFooter>
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setShowSuspendDialog(false);
                                    setSelectedUser(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={handleSuspendUser}
                                  disabled={!suspensionReason.trim() || isActionLoading}
                                >
                                  {isActionLoading ? "Suspending..." : "Suspend Account"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                        
                        <AlertDialog open={showDeleteDialog && selectedUser?.id === user.id} onOpenChange={(open) => {
                          setShowDeleteDialog(open);
                          if (!open) setSelectedUser(null);
                        }}>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 w-8 p-0 text-red-600"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete {selectedUser?.fullName}'s account 
                                and remove all their data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => {
                                setShowDeleteDialog(false);
                                setSelectedUser(null);
                              }}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={handleDeleteUser}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={isActionLoading}
                              >
                                {isActionLoading ? "Deleting..." : "Delete Account"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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
    </Card>
  );
};

export default UserManagement;
