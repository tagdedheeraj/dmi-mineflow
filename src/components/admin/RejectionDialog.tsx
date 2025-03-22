
import React from 'react';
import { WithdrawalRequest } from '@/lib/withdrawalTypes';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface RejectionDialogProps {
  selectedRequest: WithdrawalRequest | null;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  onReject: () => void;
}

const RejectionDialog: React.FC<RejectionDialogProps> = ({
  selectedRequest,
  rejectionReason,
  setRejectionReason,
  onReject
}) => {
  const handleReject = () => {
    if (rejectionReason.trim() !== '') {
      onReject();
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Reject Withdrawal Request</DialogTitle>
        <DialogDescription>
          Please provide a reason for rejecting this withdrawal request.
          The amount will be returned to the user's account.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <div className="font-medium">User:</div>
          <div className="col-span-3">{selectedRequest?.userName}</div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <div className="font-medium">Amount:</div>
          <div className="col-span-3 font-medium">
            {formatCurrency(selectedRequest?.amount || 0)}
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="reason" className="font-medium">
            Rejection Reason:
          </label>
          <Input
            id="reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter reason for rejection"
          />
        </div>
      </div>
      
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button 
          variant="destructive" 
          onClick={handleReject}
          disabled={!rejectionReason.trim()}
        >
          Confirm Rejection
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default RejectionDialog;
