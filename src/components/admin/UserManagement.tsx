
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types
import { UserData } from './types/userManagement';

// Utils
import { fetchAllUsers } from './utils/userManagementUtils';

// Components
import UsersTable from './UsersTable';
import TablePagination from './TablePagination';
import UserSuspendDialog from './UserSuspendDialog';
import UserDeleteDialog from './UserDeleteDialog';

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

  // Load users on component mount
  useEffect(() => {
    loadUsers();
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

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const usersData = await fetchAllUsers();
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

  // Event handlers for opening dialogs
  const handleOpenSuspendDialog = (user: UserData) => {
    setSelectedUser(user);
    setShowSuspendDialog(true);
  };

  const handleOpenDeleteDialog = (user: UserData) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleCloseSuspendDialog = () => {
    setShowSuspendDialog(false);
    setSelectedUser(null);
    setSuspensionReason("");
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
    setSelectedUser(null);
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
            onClick={loadUsers} 
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
        ) : (
          <div className="overflow-x-auto">
            <UsersTable 
              users={currentUsers}
              onSuspend={handleOpenSuspendDialog}
              onReactivate={handleReactivateUser}
              onDelete={handleOpenDeleteDialog}
              isActionLoading={isActionLoading}
            />
            
            <TablePagination 
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredUsers.length}
              itemsPerPage={usersPerPage}
              onPrevPage={prevPage}
              onNextPage={nextPage}
            />
          </div>
        )}

        {/* Dialogs */}
        <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
          <UserSuspendDialog 
            selectedUser={selectedUser}
            suspensionReason={suspensionReason}
            setSuspensionReason={setSuspensionReason}
            onCancel={handleCloseSuspendDialog}
            onSuspend={handleSuspendUser}
            isActionLoading={isActionLoading}
          />
        </Dialog>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <UserDeleteDialog 
            selectedUser={selectedUser}
            onCancel={handleCloseDeleteDialog}
            onDelete={handleDeleteUser}
            isActionLoading={isActionLoading}
          />
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
