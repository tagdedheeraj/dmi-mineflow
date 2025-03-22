
import { useEffect, useCallback } from 'react';
import { getUser } from '@/lib/firestore';
import { ActivePlan } from '@/lib/storage';
import { useWithdrawal } from './wallet/useWithdrawal';
import { useWalletRefresh } from './wallet/useWalletRefresh';
import { usePlanStatus } from './wallet/usePlanStatus';

export const useWalletData = (
  userId: string | undefined, 
  updateUser: (user: any) => void, 
  activePlans: ActivePlan[],
  userBalance: number
) => {
  // Use the individual hooks
  const {
    refreshTrigger,
    setRefreshTrigger,
    isRefreshing,
    setIsRefreshing,
    handleRefresh
  } = useWalletRefresh(userId, updateUser);

  const {
    withdrawalRequests,
    isWithdrawalModalOpen,
    setIsWithdrawalModalOpen,
    isLoading,
    loadWithdrawalRequests,
    handleWithdrawalRequest
  } = useWithdrawal(userId, updateUser);

  const {
    planDaysRemaining,
    claimableStatus,
    isClaimingPlan,
    handleClaimEarnings
  } = usePlanStatus(userId, activePlans, updateUser, refreshTrigger);

  // Load initial data
  useEffect(() => {
    if (userId) {
      const refreshUserData = async () => {
        try {
          console.log("Refreshing user data from Wallet page, user ID:", userId);
          setIsRefreshing(true);
          const latestUserData = await getUser(userId);
          if (latestUserData) {
            console.log("Updated user data:", latestUserData);
            console.log("USDT Earnings:", latestUserData.usdtEarnings);
            updateUser(latestUserData);
          }
          await loadWithdrawalRequests();
          setIsRefreshing(false);
        } catch (error) {
          console.error("Error refreshing user data:", error);
          setIsRefreshing(false);
        }
      };
      
      refreshUserData();

      const intervalId = setInterval(() => {
        console.log("Running periodic user data refresh");
        refreshUserData();
      }, 30000);

      return () => clearInterval(intervalId);
    }
  }, [userId, updateUser, loadWithdrawalRequests, refreshTrigger, setIsRefreshing]);

  // Combine and return all the hooks' values
  return {
    withdrawalRequests,
    planDaysRemaining,
    isRefreshing,
    isWithdrawalModalOpen,
    setIsWithdrawalModalOpen,
    isLoading,
    claimableStatus,
    isClaimingPlan,
    handleRefresh,
    handleClaimEarnings,
    handleWithdrawalRequest
  };
};

export default useWalletData;
