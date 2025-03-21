
import { useState, useEffect, useCallback } from 'react';
import { 
  getClaimableRewards, 
  claimReward, 
  getUserClaimableRewards,
  getTimeUntilNextClaim,
  ClaimableReward,
  createClaimableReward  // Add this import for debugging purpose
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
  
  const loadRewards = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      console.log("Fetching claimable rewards for user:", userId);
      
      const claimable = await getClaimableRewards(userId);
      console.log("Claimable rewards:", claimable);
      setClaimableRewards(claimable);
      
      const all = await getUserClaimableRewards(userId);
      console.log("All rewards:", all);
      setAllRewards(all);
      
      // Initialize countdowns
      const plans = [...new Set(all.map(r => r.planId))];
      const timeRemaining: Record<string, number> = {};
      
      for (const planId of plans) {
        timeRemaining[planId] = await getTimeUntilNextClaim(userId, planId);
      }
      
      setCountdowns(timeRemaining);
    } catch (error) {
      console.error("Error loading claimable rewards:", error);
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
  
  useEffect(() => {
    loadRewards();
    
    // Set up timer to refresh rewards every minute
    const intervalId = setInterval(() => {
      loadRewards();
    }, 60000);
    
    // Set up timer to update countdowns every second
    const countdownInterval = setInterval(() => {
      updateCountdowns();
    }, 1000);
    
    return () => {
      clearInterval(intervalId);
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
    formatCountdown,
    loadRewards,
    handleClaim
  };
};
