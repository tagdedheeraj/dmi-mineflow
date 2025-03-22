
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { UserData } from './types/userManagement';

interface UserDeleteDialogProps {
  selectedUser: UserData | null;
  onCancel: () => void;
  onDelete: () => void;
  isActionLoading: boolean;
}

const UserDeleteDialog: React.FC<UserDeleteDialogProps> = ({
  selectedUser,
  onCancel,
  onDelete,
  isActionLoading
}) => {
  if (!selectedUser) return null;
  
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete User Account</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete {selectedUser.fullName}'s account 
          and remove all their data from our servers.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction 
          onClick={onDelete}
          className="bg-red-600 hover:bg-red-700"
          disabled={isActionLoading}
        >
          {isActionLoading ? "Deleting..." : "Delete Account"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};

export default UserDeleteDialog;
