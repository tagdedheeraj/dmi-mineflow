import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  submitKYCRequest, 
  getUserKYCStatus, 
  getKYCSettings,
  KYCDocument,
} from '@/lib/firestore/kyc';

export const useKYC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState<KYCDocument | null>(null);
  const [isKYCEnabled, setIsKYCEnabled] = useState<boolean | null>(null);
  
  // Load KYC status for the current user
  const loadKycStatus = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const status = await getUserKYCStatus(user.id);
      setKycStatus(status);
      console.log("KYC status loaded:", status);
    } catch (error) {
      console.error("Error loading KYC status:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  // Load KYC global settings
  const loadKycSettings = useCallback(async () => {
    try {
      const settings = await getKYCSettings();
      console.log("KYC settings loaded:", settings);
      setIsKYCEnabled(settings.isEnabled);
    } catch (error) {
      console.error("Error loading KYC settings:", error);
      // Don't set to false on error, keep as null
    }
  }, []);
  
  // Submit a new KYC verification request
  const submitKYC = useCallback(async (formData: Omit<KYCDocument, 'status' | 'submittedAt' | 'id' | 'userId'>) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit KYC verification",
        variant: "destructive",
      });
      return false;
    }
    
    setIsLoading(true);
    try {
      await submitKYCRequest({
        ...formData,
        userId: user.id,
      });
      
      toast({
        title: "KYC Submitted",
        description: "Your KYC verification request has been submitted and is pending review",
      });
      
      // Refresh KYC status immediately after submission
      await loadKycStatus();
      return true;
    } catch (error: any) {
      console.error("Error submitting KYC:", error);
      toast({
        title: "KYC Submission Failed",
        description: error.message || "An error occurred while submitting your KYC verification",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, loadKycStatus]);
  
  // Load initial data once on component mount
  useEffect(() => {
    if (!user) return;
    
    // Initial load
    loadKycStatus();
    loadKycSettings();
    
  }, [loadKycStatus, loadKycSettings, user]);
  
  // Determine if the user needs to complete KYC
  const needsKYC = useCallback(() => {
    // If KYC settings are still loading (null), assume no verification needed yet
    if (isKYCEnabled === null) return false;
    
    // If KYC is not enabled globally, user doesn't need to complete it
    if (!isKYCEnabled) return false;
    
    // If the user has no KYC status or it was rejected, they need to complete it
    if (!kycStatus) return true;
    
    // If the user has a pending or approved KYC, they don't need to complete it
    return kycStatus.status === 'rejected';
  }, [kycStatus, isKYCEnabled]);
  
  return {
    isLoading,
    kycStatus,
    isKYCEnabled,
    submitKYC,
    loadKycStatus,
    needsKYC,
  };
};
