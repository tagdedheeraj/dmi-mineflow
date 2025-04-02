
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Image,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { KYCDocument } from '@/lib/firestore';
import KYCStatusBadge from './KYCStatusBadge';
import { format } from 'date-fns';

interface KYCDetailsDialogProps {
  kycRequest: KYCDocument | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onApprove: (kycId: string) => void;
  onShowRejectionDialog: () => void;
}

const KYCDetailsDialog: React.FC<KYCDetailsDialogProps> = ({
  kycRequest,
  isOpen,
  isLoading,
  onClose,
  onApprove,
  onShowRejectionDialog
}) => {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    if (timestamp.toDate) {
      // Firestore timestamp
      return format(timestamp.toDate(), 'PPP p');
    } else if (typeof timestamp === 'string') {
      return format(new Date(timestamp), 'PPP');
    }
    
    return 'N/A';
  };

  if (!kycRequest) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            KYC Verification Details
          </DialogTitle>
          <DialogDescription>
            Submitted on {formatDate(kycRequest.submittedAt)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <h4 className="font-medium flex items-center gap-1 mb-2">
              <User className="h-4 w-4" />
              Personal Information
            </h4>
            
            <div className="space-y-3 bg-gray-50 p-3 rounded-md">
              <div>
                <Label className="text-xs text-gray-500">Full Name</Label>
                <div className="font-medium">{kycRequest.fullName}</div>
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">Document Type</Label>
                <div className="font-medium">
                  {kycRequest.documentType === 'government_id' ? 'Government ID' : 'Passport'}
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">ID Number</Label>
                <div className="font-medium">{kycRequest.idNumber}</div>
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">Address</Label>
                <div className="font-medium">{kycRequest.address}</div>
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">Document Expiry</Label>
                <div className="font-medium">{kycRequest.documentExpiryDate}</div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium flex items-center gap-1 mb-2">
              <Image className="h-4 w-4" />
              Document Images
            </h4>
            
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-500">ID Front</Label>
                <div className="mt-1 h-32 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                  <img 
                    src={kycRequest.frontImageUrl} 
                    alt="ID Front" 
                    className="max-h-full object-contain"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">ID Back</Label>
                <div className="mt-1 h-32 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                  <img 
                    src={kycRequest.backImageUrl} 
                    alt="ID Back" 
                    className="max-h-full object-contain"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">Selfie</Label>
                <div className="mt-1 h-32 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                  <img 
                    src={kycRequest.selfieImageUrl} 
                    alt="Selfie" 
                    className="max-h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div>
          <h4 className="font-medium flex items-center gap-1 mb-2">
            <Clock className="h-4 w-4" />
            Verification Status
          </h4>
          
          <div className="flex items-center gap-2 mb-4">
            <KYCStatusBadge status={kycRequest.status} />
            
            {kycRequest.reviewedAt && (
              <span className="text-sm text-gray-500">
                Reviewed on {formatDate(kycRequest.reviewedAt)}
              </span>
            )}
          </div>
          
          {kycRequest.status === 'rejected' && kycRequest.rejectionReason && (
            <div className="bg-red-50 p-3 rounded-md">
              <Label className="text-xs text-red-700">Rejection Reason</Label>
              <div className="text-red-700">{kycRequest.rejectionReason}</div>
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-4 gap-2">
          {kycRequest.status === 'pending' && (
            <>
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
                onClick={onShowRejectionDialog}
                disabled={isLoading}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
              
              <Button 
                type="button"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => kycRequest.id && onApprove(kycRequest.id)}
                disabled={isLoading}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </>
          )}
          
          {kycRequest.status !== 'pending' && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KYCDetailsDialog;
