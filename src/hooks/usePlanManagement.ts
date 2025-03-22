
import { useCallback } from 'react';
import { ActivePlan } from '@/lib/storage';
import { saveActivePlan } from '@/lib/firestore';
import { addPlanPurchaseRewards } from '@/lib/rewards/planPurchaseRewards';
import { miningPlans } from '@/data/miningPlans';

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
      console.log(`[CRITICAL] Updating mining boost with boost=${miningBoost}, duration=${durationDays}, plan=${planId}, dailyEarnings=${dailyEarnings}, planPrice=${planPrice}`);
      
      const now = new Date();
      const expiryDate = new Date(now);
      expiryDate.setDate(expiryDate.getDate() + durationDays);
      
      // Find the plan name from miningPlans
      const planInfo = miningPlans.find(p => p.id === planId);
      if (!planInfo) {
        console.error(`Plan with id ${planId} not found in miningPlans`);
        return null;
      }

      const newPlan = {
        id: planId,
        name: planInfo.name, // Store the exact plan name from miningPlans
        boostMultiplier: miningBoost,
        duration: durationDays,
        purchasedAt: now.toISOString(),
        expiresAt: expiryDate.toISOString(),
        planCost: planPrice
      };
      
      // First save the active plan
      console.log(`[CRITICAL] Saving active plan for user ${userId}`);
      await saveActivePlan(userId, newPlan);
      
      // Then process first-day rewards and referral commissions
      console.log(`[CRITICAL] Processing plan purchase rewards for user ${userId}`);
      console.log(`[REFERRAL DEBUG] Plan parameters: price=${planPrice}, dailyEarnings=${dailyEarnings}, planId=${planId}`);
      const updatedUser = await addPlanPurchaseRewards(
        userId,
        planPrice,
        dailyEarnings,
        planId
      );
      
      console.log(`[CRITICAL] Plan purchase rewards processed. Updated user:`, updatedUser);
      console.log(`[CRITICAL] User USDT earnings after update: ${updatedUser?.usdtEarnings}`);
      
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
