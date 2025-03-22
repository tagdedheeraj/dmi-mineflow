
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserData } from './types/userManagement';

interface UserSuspendDialogProps {
  selectedUser: UserData | null;
  suspensionReason: string;
  setSuspensionReason: (reason: string) => void;
  onCancel: () => void;
  onSuspend: () => void;
  isActionLoading: boolean;
}

const UserSuspendDialog: React.FC<UserSuspendDialogProps> = ({
  selectedUser,
  suspensionReason,
  setSuspensionReason,
  onCancel,
  onSuspend,
  isActionLoading
}) => {
  if (!selectedUser) return null;
  
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Suspend User Account</DialogTitle>
        <DialogDescription>
          This will prevent {selectedUser.fullName} from accessing their account. 
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
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          variant="destructive"
          onClick={onSuspend}
          disabled={!suspensionReason.trim() || isActionLoading}
        >
          {isActionLoading ? "Suspending..." : "Suspend Account"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default UserSuspendDialog;
