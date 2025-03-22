
import { useState, useEffect, useCallback } from 'react';
import { ActivePlan } from '@/lib/storage';
import { getUser } from '@/lib/firestore';
import { canClaimPlanEarnings, getNextClaimTime, claimPlanEarnings } from '@/lib/rewards/claimManager';
import { miningPlans } from '@/data/miningPlans';
import { useToast } from '@/hooks/use-toast';

export const usePlanStatus = (
  userId: string | undefined,
  activePlans: ActivePlan[],
  updateUser: (user: any) => void,
  refreshTrigger: number
) => {
  const { toast } = useToast();
  const [planDaysRemaining, setPlanDaysRemaining] = useState<Record<string, number>>({});
  const [claimableStatus, setClaimableStatus] = useState<Record<string, {
    canClaim: boolean;
    nextClaimTime: Date | null;
    isLoading: boolean;
    dailyEarnings: number; 
  }>>({});
  const [isClaimingPlan, setIsClaimingPlan] = useState<string | null>(null);

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
        
        // Find the plan info to get daily earnings - ensure this information is loaded correctly
        const planInfo = miningPlans.find(p => p.id === plan.id);
        const dailyEarnings = planInfo?.dailyEarnings || 0;
        
        console.log(`Loading plan ${plan.id}, dailyEarnings: ${dailyEarnings}`);
        
        newStatus[plan.id] = {
          canClaim: false,
          nextClaimTime: null,
          isLoading: true,
          dailyEarnings
        };
      }
      
      setClaimableStatus(newStatus);
      
      for (const plan of activePlans) {
        if (new Date() >= new Date(plan.expiresAt)) continue;
        
        try {
          const canClaim = await canClaimPlanEarnings(userId, plan.id);
          const nextTime = await getNextClaimTime(userId, plan.id);
          
          // Find the plan info to get daily earnings
          const planInfo = miningPlans.find(p => p.id === plan.id);
          const dailyEarnings = planInfo?.dailyEarnings || 0;
          
          console.log(`Plan ${plan.id} claim status: canClaim=${canClaim}, nextClaimTime=${nextTime}, dailyEarnings=${dailyEarnings}`);
          
          setClaimableStatus(prev => ({
            ...prev,
            [plan.id]: {
              canClaim,
              nextClaimTime: nextTime,
              isLoading: false,
              dailyEarnings
            }
          }));
        } catch (error) {
          console.error(`Error checking claim status for plan ${plan.id}:`, error);
          
          // Still get daily earnings even if there's an error
          const planInfo = miningPlans.find(p => p.id === plan.id);
          const dailyEarnings = planInfo?.dailyEarnings || 0;
          
          setClaimableStatus(prev => ({
            ...prev,
            [plan.id]: {
              canClaim: false,
              nextClaimTime: null,
              isLoading: false,
              dailyEarnings
            }
          }));
        }
      }
    };
    
    if (userId && activePlans.length > 0) {
      checkClaimStatus();
    }
  }, [userId, activePlans, refreshTrigger]);

  // Handle claim earnings
  const handleClaimEarnings = useCallback(async (planId: string) => {
    if (!userId || isClaimingPlan) return;
    
    const planInfo = miningPlans.find(p => p.id === planId);
    if (!planInfo) {
      console.error(`Plan with ID ${planId} not found`);
      return;
    }
    
    console.log(`Attempting to claim earnings for plan ${planId} with daily earnings: ${planInfo.dailyEarnings}`);
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
        
        // Update the next claim time to 24 hours from now
        const nextClaimTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        // Update claim status immediately
        setClaimableStatus(prev => ({
          ...prev,
          [planId]: {
            ...prev[planId],
            canClaim: false,
            nextClaimTime: nextClaimTime,
            dailyEarnings: planInfo.dailyEarnings
          }
        }));
        
        console.log(`Claim successful for plan ${planId}. Next claim time set to ${nextClaimTime}`);
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
    }
  }, [userId, toast, updateUser, isClaimingPlan]);

  return {
    planDaysRemaining,
    claimableStatus,
    isClaimingPlan,
    handleClaimEarnings
  };
};
