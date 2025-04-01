
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  submitKYCRequest, 
  getUserKYCStatus, 
  KYCDocument,
  getKYCSettings,
} from '@/lib/firestore';

export const useKYC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState<KYCDocument | null>(null);
  const [isKYCEnabled, setIsKYCEnabled] = useState(false);
  
  // Load KYC status for the current user
  const loadKycStatus = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const status = await getUserKYCStatus(user.id);
      setKycStatus(status);
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
      setIsKYCEnabled(settings.isEnabled);
    } catch (error) {
      console.error("Error loading KYC settings:", error);
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
      
      // Refresh KYC status
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
  
  // Load KYC status and settings on component mount
  useEffect(() => {
    loadKycStatus();
    loadKycSettings();
  }, [loadKycStatus, loadKycSettings]);
  
  // Determine if the user needs to complete KYC
  const needsKYC = useCallback(() => {
    // If KYC is not enabled globally, user doesn't need to complete it
    if (!isKYCEnabled) return false;
    
    // If the user has no KYC status or it was rejected, they need to complete it
    if (!kycStatus || kycStatus.status === 'rejected') return true;
    
    // If the user has a pending or approved KYC, they don't need to complete it
    return false;
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
