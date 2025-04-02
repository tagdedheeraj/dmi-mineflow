
import React, { useState } from 'react';
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
  // Add error state to track validation errors
  const [error, setError] = useState<string | null>(null);
  
  // Validate before submitting
  const handleReject = () => {
    if (!rejectionReason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }
    
    setError(null);
    onReject();
  };

  // Close handler that also clears errors
  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
            onChange={(e) => {
              setError(null);
              onRejectionReasonChange(e.target.value);
            }}
            className={`mt-1 ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            rows={4}
          />
          {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
        </div>
        
        <DialogFooter className="mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          
          <Button 
            type="button" 
            variant="destructive"
            onClick={handleReject}
            disabled={isLoading}
          >
            {isLoading ? 'Rejecting...' : 'Reject Verification'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KYCRejectionDialog;
