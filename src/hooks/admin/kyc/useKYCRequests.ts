
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAllKYCRequests, KYCDocument } from '@/lib/firestore';

export const useKYCRequests = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [kycRequests, setKycRequests] = useState<KYCDocument[]>([]);
  const [statusFilter, setStatusFilter] = useState('pending');

  // Load all KYC requests
  const loadKYCRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const requests = await getAllKYCRequests(statusFilter);
      setKycRequests(requests);
    } catch (error) {
      console.error("Error loading KYC requests:", error);
      toast({
        title: "Error",
        description: "Failed to load KYC requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, toast]);

  // Load data on component mount and when status filter changes
  useEffect(() => {
    loadKYCRequests();
  }, [loadKYCRequests]);

  return {
    isLoading,
    kycRequests,
    statusFilter,
    setStatusFilter,
    loadKYCRequests,
  };
};
