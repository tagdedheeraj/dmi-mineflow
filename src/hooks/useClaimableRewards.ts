
import { useState, useEffect, useCallback } from 'react';
import { 
  getClaimableRewards, 
  claimReward, 
  getUserClaimableRewards,
  getTimeUntilNextClaim,
  ClaimableReward,
  initializeRewardsForAllActivePlans
} from '@/lib/rewards/claimableRewards';
import { useToast } from '@/hooks/use-toast';
import { getUser } from '@/lib/rewards/rewardsTracking';

export const useClaimableRewards = (userId: string | undefined) => {
  const { toast } = useToast();
  const [claimableRewards, setClaimableRewards] = useState<ClaimableReward[]>([]);
  const [allRewards, setAllRewards] = useState<ClaimableReward[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [countdowns, setCountdowns] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  
  const loadRewards = useCallback(async (activePlans?: any[]) => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching claimable rewards for user:", userId);
      
      // If we have active plans and no rewards, initialize them first
      if (activePlans && activePlans.length > 0) {
        const hasRewards = await getUserClaimableRewards(userId);
        if (hasRewards.length === 0) {
          console.log("No rewards found, initializing rewards for active plans");
          await initializeRewardsForAllActivePlans(userId, activePlans);
        }
      }
      
      const all = await getUserClaimableRewards(userId);
      console.log("All rewards:", all);
      setAllRewards(all);
      
      const claimable = await getClaimableRewards(userId);
      console.log("Claimable rewards:", claimable);
      setClaimableRewards(claimable);
      
      if (all.length === 0) {
        setError("No rewards found. Make sure you have active plans.");
      }
      
      // Initialize countdowns
      const plans = [...new Set(all.map(r => r.planId))];
      const timeRemaining: Record<string, number> = {};
      
      for (const planId of plans) {
        timeRemaining[planId] = await getTimeUntilNextClaim(userId, planId);
      }
      
      console.log("Reward countdowns:", timeRemaining);
      setCountdowns(timeRemaining);
    } catch (error) {
      console.error("Error loading claimable rewards:", error);
      setError("Failed to load rewards: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);
  
  const handleClaim = useCallback(async (rewardId: string) => {
    if (!userId || isClaiming) return;
    
    setIsClaiming(true);
    try {
      console.log("Claiming reward:", rewardId);
      const success = await claimReward(rewardId);
      
      if (success) {
        // Get the updated user to reflect new balance
        const updatedUser = await getUser(userId);
        
        // Refresh rewards
        await loadRewards();
        
        toast({
          title: "Reward Claimed!",
          description: "Your USDT earnings have been added to your balance.",
        });
        
        return updatedUser;
      } else {
        toast({
          title: "Failed to Claim",
          description: "There was an error claiming your reward. Please try again.",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error("Error claiming reward:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsClaiming(false);
    }
  }, [userId, isClaiming, toast, loadRewards]);
  
  const updateCountdowns = useCallback(async () => {
    if (!userId) return;
    
    try {
      const plans = [...new Set(allRewards.map(r => r.planId))];
      const timeRemaining: Record<string, number> = {};
      
      for (const planId of plans) {
        timeRemaining[planId] = await getTimeUntilNextClaim(userId, planId);
      }
      
      setCountdowns(timeRemaining);
    } catch (error) {
      console.error("Error updating countdowns:", error);
    }
  }, [userId, allRewards]);
  
  const manuallyInitializeRewards = useCallback(async (activePlans: any[]) => {
    if (!userId) return false;
    
    setIsLoading(true);
    try {
      console.log("Manually initializing rewards for active plans:", activePlans);
      const success = await initializeRewardsForAllActivePlans(userId, activePlans);
      
      if (success) {
        toast({
          title: "Rewards Initialized",
          description: "Your rewards have been successfully initialized.",
        });
        await loadRewards();
        return true;
      } else {
        toast({
          title: "Initialization Failed",
          description: "Failed to initialize rewards. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error initializing rewards:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while initializing rewards.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast, loadRewards]);
  
  useEffect(() => {
    if (userId) {
      loadRewards();
    }
    
    // Set up timer to update countdowns every second
    const countdownInterval = setInterval(() => {
      if (userId) {
        updateCountdowns();
      }
    }, 1000);
    
    return () => {
      clearInterval(countdownInterval);
    };
  }, [userId, loadRewards, updateCountdowns]);
  
  const formatCountdown = (seconds: number): string => {
    if (seconds <= 0) return "Available now";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return {
    claimableRewards,
    allRewards,
    isLoading,
    isClaiming,
    countdowns,
    error,
    formatCountdown,
    loadRewards,
    handleClaim,
    manuallyInitializeRewards
  };
};
