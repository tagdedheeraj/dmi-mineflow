
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  getAllKYCRequests,
  approveKYCRequest,
  rejectKYCRequest,
  getKYCRequestById,
  updateKYCSettings,
  getKYCSettings,
  KYCDocument,
} from '@/lib/firestore';

export const useKYCManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [kycRequests, setKycRequests] = useState<KYCDocument[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<KYCDocument | null>(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [isKYCEnabled, setIsKYCEnabled] = useState(false);
  
  // Load all KYC requests
  const loadKYCRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const requests = await getAllKYCRequests(statusFilter);
      setKycRequests(requests);
    } catch (error) {
      console.error("Error loading KYC requests:", error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);
  
  // Load KYC settings
  const loadKYCSettings = useCallback(async () => {
    try {
      const settings = await getKYCSettings();
      setIsKYCEnabled(settings.isEnabled);
    } catch (error) {
      console.error("Error loading KYC settings:", error);
    }
  }, []);
  
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
        await loadKYCRequests();
        
        // Close the detail view
        setSelectedRequest(null);
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
  }, [user, toast, loadKYCRequests]);
  
  // Handle rejecting a KYC request
  const handleRejectKYC = useCallback(async (kycId: string, reason: string) => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      if (!reason.trim()) {
        throw new Error("Rejection reason is required");
      }
      
      const success = await rejectKYCRequest(kycId, user.id, reason);
      
      if (success) {
        toast({
          title: "KYC Rejected",
          description: "The KYC verification request has been rejected",
        });
        
        // Refresh the list
        await loadKYCRequests();
        
        // Close the detail view
        setSelectedRequest(null);
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
  }, [user, toast, loadKYCRequests]);
  
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
  
  // Toggle KYC feature
  const toggleKYCEnabled = useCallback(async (enabled: boolean) => {
    setIsLoading(true);
    try {
      const success = await updateKYCSettings(enabled);
      
      if (success) {
        setIsKYCEnabled(enabled);
        toast({
          title: `KYC ${enabled ? 'Enabled' : 'Disabled'}`,
          description: `KYC verification has been ${enabled ? 'enabled' : 'disabled'}`,
        });
        return true;
      } else {
        throw new Error("Failed to update KYC settings");
      }
    } catch (error: any) {
      console.error("Error updating KYC settings:", error);
      toast({
        title: "Settings Update Failed",
        description: error.message || "An error occurred while updating KYC settings",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Load data on component mount
  useEffect(() => {
    loadKYCRequests();
    loadKYCSettings();
  }, [loadKYCRequests, loadKYCSettings]);
  
  return {
    isLoading,
    kycRequests,
    selectedRequest,
    statusFilter,
    isKYCEnabled,
    setStatusFilter,
    setSelectedRequest,
    loadKYCRequests,
    handleApproveKYC,
    handleRejectKYC,
    viewKYCDetails,
    toggleKYCEnabled,
  };
};
