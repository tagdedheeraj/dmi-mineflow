
import { useState, useEffect, useCallback } from 'react';
import { 
  ActivePlan, 
  getActivePlans, 
  saveActivePlan,
  claimPlanUsdtEarnings,
  getUser
} from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { miningPlans as plansData } from '@/data/miningPlans';
import { getPlanClaimStatus } from '@/lib/miningUtils';

export const useMiningPlans = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [activePlans, setActivePlans] = useState<ActivePlan[]>([]);

  // Load active plans
  useEffect(() => {
    if (user) {
      const plans = getActivePlans();
      setActivePlans(plans);
    }
  }, [user]);

  // Calculate plan claim status
  const getPlanClaimTime = useCallback((planId: string) => {
    const plan = activePlans.find(p => p.id === planId);
    return getPlanClaimStatus(plan);
  }, [activePlans]);

  // Claim plan earnings
  const claimPlanEarnings = useCallback((planId: string) => {
    if (!user) return;
    
    const planInfo = plansData.find(p => p.id === planId);
    if (!planInfo) return;
    
    const { success, planUpdated } = claimPlanUsdtEarnings(planId, planInfo.dailyEarnings);
    
    if (success && planUpdated) {
      // Update the active plans list
      setActivePlans(prev => 
        prev.map(p => p.id === planId ? planUpdated : p)
      );
      
      // Update the user info with most current data from storage
      const updatedUser = getUser();
      if (updatedUser) {
        console.log('Updated user after claim:', updatedUser);
        updateUser(updatedUser);
      }
      
      // Show notification
      toast({
        title: "USDT Claimed!",
        description: `You have claimed $${planInfo.dailyEarnings.toFixed(2)} USDT from your ${planInfo.name}.`,
      });
    } else {
      // Show error notification
      const { formattedTimeRemaining } = getPlanClaimTime(planId);
      toast({
        title: "Cannot Claim Yet",
        description: `Please wait ${formattedTimeRemaining} before claiming again.`,
        variant: "destructive",
      });
    }
  }, [user, updateUser, toast, getPlanClaimTime]);

  // Update mining boost
  const updateMiningBoost = useCallback((boostMultiplier: number, duration: number, planId: string) => {
    if (!user) return;
    
    const now = new Date();
    const expiresAt = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
    
    const newPlan: ActivePlan = {
      id: planId,
      purchasedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      boostMultiplier: boostMultiplier,
      duration: duration,
      lastClaimed: 0, // Never claimed yet
      nextClaimTime: now.getTime() // Can claim immediately after purchase
    };
    
    saveActivePlan(newPlan);
    setActivePlans(prev => [...prev, newPlan]);
    
    const planInfo = plansData.find(p => p.id === planId);
    if (planInfo) {
      // Show notification about available claim
      toast({
        title: `${planInfo.name} Activated!`,
        description: `Your plan is active and you can claim your first daily USDT earnings now.`,
      });
    }
    
    return newPlan;
  }, [user, toast]);

  return {
    activePlans,
    getPlanClaimTime,
    claimPlanEarnings,
    updateMiningBoost,
  };
};
