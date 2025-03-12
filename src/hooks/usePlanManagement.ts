
import { useCallback } from 'react';
import { ActivePlan } from '@/lib/storage';
import { saveActivePlan } from '@/lib/firestore';
import { addPlanPurchaseRewards } from '@/lib/rewards/planPurchaseRewards';
import { miningPlans, getPlans } from '@/data/miningPlans';

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
      
      // Get most up-to-date plan data - force a reload to ensure latest values
      console.log("[CRITICAL] Fetching latest plan data");
      const latestPlans = await getPlans();
      
      // Find the plan from latest plans or fall back to mining plans
      const planInfo = latestPlans.find(p => p.id === planId) || 
                       miningPlans.find(p => p.id === planId);
                       
      if (!planInfo) {
        console.error(`[CRITICAL ERROR] Plan with id ${planId} not found in available plans`);
        return null;
      }
      
      console.log(`[CRITICAL] Found plan info:`, planInfo);
      console.log(`[CRITICAL] Plan daily earnings value: ${planInfo.dailyEarnings}`);

      // Important: Use the daily earnings from the fresh plan data, not from parameters
      const actualDailyEarnings = planInfo.dailyEarnings;
      console.log(`[CRITICAL] Using actual daily earnings from plan data: ${actualDailyEarnings}`);

      const newPlan = {
        id: planId,
        name: planInfo.name,
        boostMultiplier: miningBoost,
        duration: durationDays,
        purchasedAt: now.toISOString(),
        expiresAt: expiryDate.toISOString(),
        planCost: planPrice
      };
      
      // First save the active plan
      console.log(`[CRITICAL] Saving active plan for user ${userId}`);
      await saveActivePlan(userId, newPlan);
      
      // Then process rewards (first day earnings, etc.)
      console.log(`[CRITICAL] Processing plan purchase rewards for user ${userId}`);
      console.log(`[REFERRAL DEBUG] Plan parameters: price=${planPrice}, dailyEarnings=${actualDailyEarnings}, planId=${planId}`);
      const updatedUser = await addPlanPurchaseRewards(
        userId,
        planPrice,
        actualDailyEarnings, // Use the most up-to-date daily earnings value
        planId
      );
      
      console.log(`[CRITICAL] Plan purchase rewards processed. Updated user:`, updatedUser);
      console.log(`[CRITICAL] User USDT earnings after update: ${updatedUser?.usdtEarnings}`);
      
      return newPlan;
    } catch (error) {
      console.error("[CRITICAL ERROR] Error updating mining boost:", error);
      return null;
    }
  }, [userId]);

  return {
    updateMiningBoost
  };
};
