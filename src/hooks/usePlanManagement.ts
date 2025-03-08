
import { useCallback } from 'react';
import { ActivePlan } from '@/lib/storage';
import { saveActivePlan } from '@/lib/firestore';
import { addPlanPurchaseRewards } from '@/lib/rewards/usdtEarnings';

export const usePlanManagement = (userId: string | undefined) => {
  const updateMiningBoost = useCallback(async (
    miningBoost: number, 
    durationDays: number, 
    planId: string, 
    dailyEarnings: number, 
    planPrice: number
  ): Promise<ActivePlan | null> => {
    if (!userId) return null;
    
    try {
      console.log(`Updating mining boost with boost=${miningBoost}, duration=${durationDays}, plan=${planId}`);
      
      const now = new Date();
      const expiryDate = new Date(now);
      expiryDate.setDate(expiryDate.getDate() + durationDays);
      
      const newPlan = {
        id: planId,
        boostMultiplier: miningBoost,
        duration: durationDays,
        purchasedAt: now.toISOString(),
        expiresAt: expiryDate.toISOString(),
      };
      
      await saveActivePlan(userId, newPlan);
      
      const updatedUser = await addPlanPurchaseRewards(
        userId,
        planPrice,
        dailyEarnings,
        planId
      );
      
      return newPlan;
    } catch (error) {
      console.error("Error updating mining boost:", error);
      return null;
    }
  }, [userId]);

  return {
    updateMiningBoost
  };
};
