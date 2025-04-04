import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  submitKYCRequest, 
  getUserKYCStatus, 
  getKYCSettings,
  KYCDocument,
} from '@/lib/firestore/kyc';

const KYC_SUBMISSION_KEY = 'kyc_submission_status';

export const useKYC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState<KYCDocument | null>(null);
  const [isKYCEnabled, setIsKYCEnabled] = useState<boolean | null>(null);
  const lastLoadTime = useRef<number>(0);
  const pendingKYCRef = useRef<boolean>(false); // Track if we have a pending KYC submission
  
  useEffect(() => {
    if (user) {
      const storedSubmission = localStorage.getItem(`${KYC_SUBMISSION_KEY}_${user.id}`);
      if (storedSubmission) {
        try {
          const parsedData = JSON.parse(storedSubmission);
          pendingKYCRef.current = true;
          
          if (!kycStatus) {
            setKycStatus(parsedData);
          }
        } catch (error) {
          console.error("Error parsing stored KYC data:", error);
          localStorage.removeItem(`${KYC_SUBMISSION_KEY}_${user.id}`);
        }
      }
    }
  }, [user]);
  
  const loadKycStatus = useCallback(async () => {
    if (!user) return;
    
    const now = Date.now();
    if (now - lastLoadTime.current < 5000) {
      console.log("Skipping KYC status load - too soon since last load");
      return;
    }
    
    setIsLoading(true);
    try {
      const status = await getUserKYCStatus(user.id);
      console.log("KYC status loaded:", status);
      
      if (status) {
        setKycStatus(status);
        
        if (status.status === 'approved' || status.status === 'rejected') {
          pendingKYCRef.current = false;
          localStorage.removeItem(`${KYC_SUBMISSION_KEY}_${user.id}`);
        }
      } else if (pendingKYCRef.current) {
        console.log("Maintaining pending status - no status from Firestore yet");
      } else {
        setKycStatus(null);
      }
      
      lastLoadTime.current = now;
    } catch (error) {
      console.error("Error loading KYC status:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
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
      const kycId = await submitKYCRequest({
        ...formData,
        userId: user.id,
      });
      
      toast({
        title: "KYC Submitted",
        description: "Your KYC verification request has been submitted and is pending review",
      });
      
      const tempKycStatus = {
        id: kycId,
        userId: user.id,
        status: 'pending' as const,
        submittedAt: new Date(),
        ...formData
      };
      
      setKycStatus(tempKycStatus);
      pendingKYCRef.current = true;
      
      localStorage.setItem(
        `${KYC_SUBMISSION_KEY}_${user.id}`, 
        JSON.stringify(tempKycStatus)
      );
      
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
  }, [user, toast]);
  
  useEffect(() => {
    if (!user) return;
    
    loadKycStatus();
    loadKycSettings();
  }, [loadKycStatus, loadKycSettings, user]);
  
  const needsKYC = useCallback(() => {
    if (isKYCEnabled === null) return false;
    
    if (!isKYCEnabled) return false;
    
    if (pendingKYCRef.current) return false;
    
    if (!kycStatus) return true;
    
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
