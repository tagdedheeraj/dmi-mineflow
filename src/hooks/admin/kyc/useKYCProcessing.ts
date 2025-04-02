
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { approveKYCRequest, rejectKYCRequest } from '@/lib/firestore/kyc';

export const useKYCProcessing = (onSuccess: () => Promise<void>) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle approving a KYC request
  const handleApproveKYC = useCallback(async (kycId: string) => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      const success = await approveKYCRequest(kycId, user.id);
      
      if (success) {
        toast({
          title: "KYC Approved",
          description: "The KYC verification request has been approved",
        });
        
        // Refresh the list
        await onSuccess();
        return true;
      } else {
        throw new Error("Failed to approve KYC request");
      }
    } catch (error: any) {
      console.error("Error approving KYC:", error);
      toast({
        title: "Approval Failed",
        description: error.message || "An error occurred while approving the KYC request",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, onSuccess]);
  
  // Handle rejecting a KYC request
  const handleRejectKYC = useCallback(async (kycId: string, reason: string) => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      if (!reason.trim()) {
        throw new Error("Rejection reason is required");
      }
      
      console.log("Rejecting KYC:", kycId, "with reason:", reason);
      const success = await rejectKYCRequest(kycId, user.id, reason);
      
      if (success) {
        toast({
          title: "KYC Rejected",
          description: "The KYC verification request has been rejected",
        });
        
        // Refresh the list
        await onSuccess();
        return true;
      } else {
        throw new Error("Failed to reject KYC request");
      }
    } catch (error: any) {
      console.error("Error rejecting KYC:", error);
      toast({
        title: "Rejection Failed",
        description: error.message || "An error occurred while rejecting the KYC request",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, onSuccess]);
  
  return {
    isLoading,
    handleApproveKYC,
    handleRejectKYC,
  };
};
