
import { useState, useCallback } from 'react';
import { getUser } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';

export const useWalletRefresh = (
  userId: string | undefined,
  updateUser: (user: any) => void
) => {
  const { toast } = useToast();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (isRefreshing || !userId) return;
    
    setIsRefreshing(true);
    try {
      console.log("Manual refresh triggered");
      const latestUserData = await getUser(userId);
      if (latestUserData) {
        console.log("Manual refresh - updated user data:", latestUserData);
        console.log("Manual refresh - USDT Earnings:", latestUserData.usdtEarnings);
        updateUser(latestUserData);
        
        toast({
          title: "Balance Updated",
          description: "Your wallet balance has been refreshed.",
        });
      }
      
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error during manual refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [userId, updateUser, isRefreshing, toast]);

  return {
    refreshTrigger,
    setRefreshTrigger,
    isRefreshing,
    setIsRefreshing,
    handleRefresh
  };
};
