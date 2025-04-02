
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getKYCSettings, updateKYCSettings } from '@/lib/firestore/kyc';

export const useKYCSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isKYCEnabled, setIsKYCEnabled] = useState(false);
  
  // Load KYC settings
  const loadKYCSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const settings = await getKYCSettings();
      setIsKYCEnabled(settings.isEnabled);
    } catch (error) {
      console.error("Error loading KYC settings:", error);
      toast({
        title: "Error",
        description: "Failed to load KYC settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Toggle KYC enabled status
  const toggleKYCEnabled = useCallback(async () => {
    setIsLoading(true);
    try {
      const newStatus = !isKYCEnabled;
      const success = await updateKYCSettings(newStatus);
      
      if (success) {
        setIsKYCEnabled(newStatus);
        toast({
          title: "KYC Settings Updated",
          description: `KYC verification is now ${newStatus ? 'enabled' : 'disabled'}`,
        });
      } else {
        throw new Error("Failed to update KYC settings");
      }
    } catch (error) {
      console.error("Error toggling KYC settings:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update KYC settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isKYCEnabled, toast]);
  
  // Load settings on component mount
  useEffect(() => {
    loadKYCSettings();
  }, [loadKYCSettings]);
  
  return {
    isLoading,
    isKYCEnabled,
    toggleKYCEnabled,
    loadKYCSettings,
  };
};
