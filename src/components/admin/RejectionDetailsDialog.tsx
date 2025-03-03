
import React from 'react';
import { WithdrawalRequest } from '@/lib/withdrawalTypes';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface RejectionDetailsDialogProps {
  request: WithdrawalRequest;
}

const RejectionDetailsDialog: React.FC<RejectionDetailsDialogProps> = ({ request }) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Rejection Details</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <div className="font-medium">User:</div>
          <div className="col-span-3">{request.userName}</div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <div className="font-medium">Amount:</div>
          <div className="col-span-3 font-medium">
            {formatCurrency(request.amount || 0)}
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <div className="font-medium">Reason:</div>
          <div className="col-span-3">
            {request.rejectionReason || "No reason provided"}
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <DialogClose asChild>
          <Button>Close</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default RejectionDetailsDialog;
