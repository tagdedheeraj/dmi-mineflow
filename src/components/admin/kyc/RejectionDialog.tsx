
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface RejectionDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  rejectionReason: string;
  onRejectionReasonChange: (reason: string) => void;
  onClose: () => void;
  onReject: () => void;
}

const RejectionDialog: React.FC<RejectionDialogProps> = ({
  isOpen,
  isLoading,
  rejectionReason,
  onRejectionReasonChange,
  onClose,
  onReject
}) => {
  // Handle safe closure
  const handleSafeClose = () => {
    if (!isLoading) {
      onClose();
    }
  };
  
  // Handle safe rejection
  const handleSafeReject = () => {
    if (!isLoading && rejectionReason.trim()) {
      onReject();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleSafeClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject KYC Verification</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this KYC verification request.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <Label htmlFor="rejection-reason">Rejection Reason</Label>
          <Textarea
            id="rejection-reason"
            placeholder="Enter the reason for rejection..."
            value={rejectionReason}
            onChange={(e) => onRejectionReasonChange(e.target.value)}
            className="mt-1"
            rows={4}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            This reason will be visible to the user to help them fix their submission.
          </p>
        </div>
        
        <DialogFooter className="mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleSafeClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          
          <Button 
            type="button" 
            variant="destructive"
            onClick={handleSafeReject}
            disabled={isLoading || !rejectionReason.trim()}
          >
            {isLoading ? "Rejecting..." : "Reject Verification"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectionDialog;
