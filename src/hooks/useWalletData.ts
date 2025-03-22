
import { useState, useEffect, useCallback } from 'react';
import { getUser } from '@/lib/firestore';
import { createWithdrawalRequest } from '@/lib/withdrawals';
import { useToast } from '@/hooks/use-toast';
import { WithdrawalRequest } from '@/lib/withdrawalTypes';
import { canClaimPlanEarnings, getNextClaimTime, claimPlanEarnings } from '@/lib/rewards/claimManager';
import { miningPlans } from '@/data/miningPlans';
import { ActivePlan } from '@/lib/storage';

// Import the getUserWithdrawalRequests function from withdrawals.ts instead of firestore.ts
import { getUserWithdrawalRequests } from '@/lib/withdrawals';

export const useWalletData = (
  userId: string | undefined, 
  updateUser: (user: any) => void, 
  activePlans: ActivePlan[],
  userBalance: number
) => {
  const { toast } = useToast();
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [planDaysRemaining, setPlanDaysRemaining] = useState<Record<string, number>>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [claimableStatus, setClaimableStatus] = useState<Record<string, {
    canClaim: boolean;
    nextClaimTime: Date | null;
    isLoading: boolean;
  }>>({});
  const [isClaimingPlan, setIsClaimingPlan] = useState<string | null>(null);

  // Load withdrawal requests
  const loadWithdrawalRequests = useCallback(async () => {
    if (!userId) return;
    
    try {
      const requests = await getUserWithdrawalRequests(userId);
      setWithdrawalRequests(requests);
    } catch (error) {
      console.error("Failed to load withdrawal requests:", error);
    }
  }, [userId]);

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

  // Calculate remaining days for plans
  useEffect(() => {
    const calculateRemainingDays = () => {
      const daysMap: Record<string, number> = {};
      
      activePlans.forEach(plan => {
        const expiryDate = new Date(plan.expiresAt);
        const now = new Date();
        
        const diffTime = expiryDate.getTime() - now.getTime();
        const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
        
        daysMap[plan.id] = diffDays;
      });
      
      setPlanDaysRemaining(daysMap);
    };
    
    calculateRemainingDays();
    
    const intervalId = setInterval(calculateRemainingDays, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [activePlans]);

  // Check claim status for plans
  useEffect(() => {
    const checkClaimStatus = async () => {
      if (!userId) return;
      
      const newStatus: Record<string, any> = {};
      
      for (const plan of activePlans) {
        if (new Date() >= new Date(plan.expiresAt)) continue;
        
        newStatus[plan.id] = {
          canClaim: false,
          nextClaimTime: null,
          isLoading: true
        };
      }
      
      setClaimableStatus(newStatus);
      
      for (const plan of activePlans) {
        if (new Date() >= new Date(plan.expiresAt)) continue;
        
        try {
          const canClaim = await canClaimPlanEarnings(userId, plan.id);
          const nextTime = await getNextClaimTime(userId, plan.id);
          
          setClaimableStatus(prev => ({
            ...prev,
            [plan.id]: {
              canClaim,
              nextClaimTime: nextTime,
              isLoading: false
            }
          }));
        } catch (error) {
          console.error(`Error checking claim status for plan ${plan.id}:`, error);
          setClaimableStatus(prev => ({
            ...prev,
            [plan.id]: {
              canClaim: false,
              nextClaimTime: null,
              isLoading: false
            }
          }));
        }
      }
    };
    
    if (userId && activePlans.length > 0) {
      checkClaimStatus();
    }
  }, [userId, activePlans, refreshTrigger]);

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
  }, [userId, updateUser, loadWithdrawalRequests, refreshTrigger]);

  // Handle claim earnings
  const handleClaimEarnings = useCallback(async (planId: string) => {
    if (!userId || isClaimingPlan) return;
    
    const planInfo = miningPlans.find(p => p.id === planId);
    if (!planInfo) {
      console.error(`Plan with ID ${planId} not found`);
      return;
    }
    
    setIsClaimingPlan(planId);
    
    try {
      const success = await claimPlanEarnings(userId, planId, planInfo.dailyEarnings);
      
      if (success) {
        const updatedUser = await getUser(userId);
        if (updatedUser) {
          updateUser(updatedUser);
        }
        
        toast({
          title: "USDT Claimed!",
          description: `You have successfully claimed ${planInfo.dailyEarnings.toFixed(2)} USDT from your ${planInfo.name}.`,
        });
        
        setClaimableStatus(prev => ({
          ...prev,
          [planId]: {
            ...prev[planId],
            canClaim: false,
            nextClaimTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          }
        }));
      } else {
        toast({
          title: "Claim Failed",
          description: "There was an error claiming your USDT. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error claiming USDT earnings:", error);
      toast({
        title: "Claim Error",
        description: "There was an error processing your claim. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsClaimingPlan(null);
      setRefreshTrigger(prev => prev + 1);
    }
  }, [userId, toast, updateUser]);

  // Handle withdrawal
  const handleWithdrawalRequest = useCallback(async (amount: number) => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const latestUser = await getUser(userId);
      if (!latestUser) {
        throw new Error("Could not get latest user data");
      }

      if (amount <= 0 || amount > latestUser.usdtEarnings) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid withdrawal amount.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const requestId = await createWithdrawalRequest(
        userId,
        latestUser.fullName,
        latestUser.email,
        amount,
        latestUser.usdtAddress || ''
      );

      if (requestId) {
        const updatedUser = { 
          ...latestUser, 
          usdtEarnings: latestUser.usdtEarnings ? latestUser.usdtEarnings - amount : 0 
        };
        updateUser(updatedUser);
        
        setIsWithdrawalModalOpen(false);
        toast({
          title: "Withdrawal Requested",
          description: "Your withdrawal request has been submitted and will be processed shortly.",
        });
        
        await loadWithdrawalRequests();
      } else {
        throw new Error("Failed to create withdrawal request");
      }
    } catch (error) {
      console.error("Error creating withdrawal request:", error);
      toast({
        title: "Error",
        description: "Failed to submit withdrawal request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast, updateUser, loadWithdrawalRequests]);

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
