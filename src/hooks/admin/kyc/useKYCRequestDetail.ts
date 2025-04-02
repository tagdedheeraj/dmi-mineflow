
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getKYCRequestById, KYCDocument } from '@/lib/firestore/kyc';

export const useKYCRequestDetail = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<KYCDocument | null>(null);
  
  // Get details of a specific KYC request
  const viewKYCDetails = useCallback(async (kycId: string) => {
    setIsLoading(true);
    try {
      const kycDetails = await getKYCRequestById(kycId);
      setSelectedRequest(kycDetails);
    } catch (error) {
      console.error("Error loading KYC details:", error);
      toast({
        title: "Error",
        description: "Failed to load KYC details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  return {
    isLoading,
    selectedRequest,
    setSelectedRequest,
    viewKYCDetails,
  };
};
