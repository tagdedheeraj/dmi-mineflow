
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

interface KYCRejectionDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  rejectionReason: string;
  onRejectionReasonChange: (reason: string) => void;
  onClose: () => void;
  onReject: () => void;
}

const KYCRejectionDialog: React.FC<KYCRejectionDialogProps> = ({
  isOpen,
  isLoading,
  rejectionReason,
  onRejectionReasonChange,
  onClose,
  onReject
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          />
        </div>
        
        <DialogFooter className="mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          
          <Button 
            type="button" 
            variant="destructive"
            onClick={onReject}
            disabled={isLoading || !rejectionReason.trim()}
          >
            Reject Verification
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KYCRejectionDialog;
