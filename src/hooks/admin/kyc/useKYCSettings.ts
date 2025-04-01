
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateKYCSettings, getKYCSettings } from '@/lib/firestore';

export const useKYCSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isKYCEnabled, setIsKYCEnabled] = useState(false);
  
  // Load KYC settings
  const loadKYCSettings = useCallback(async () => {
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
  
  // Load settings on component mount
  useEffect(() => {
    loadKYCSettings();
  }, [loadKYCSettings]);
  
  return {
    isLoading,
    isKYCEnabled,
    loadKYCSettings,
    toggleKYCEnabled,
  };
};
