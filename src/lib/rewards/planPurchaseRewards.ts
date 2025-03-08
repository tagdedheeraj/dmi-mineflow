
import { User } from '../storage';
import { getTodayDateKey } from './dateUtils';
import { getUser } from './rewardsTracking';
import { updateUsdtEarnings } from './earningsUpdater';
import { awardPlanPurchaseCommission } from './referralCommissions';
import { wasPlanPurchasedToday, markPlanAsPurchasedToday } from './planPurchaseManager';
import { updateLastUsdtUpdateDate } from './dateTracking';

// Enhanced function for plan purchase rewards with duplicate prevention
export const addPlanPurchaseRewards = async (
  userId: string, 
  planCost: number, 
  dailyEarnings: number, 
  planId: string
): Promise<User | null> => {
  try {
    console.log(`[PLAN PURCHASE] Processing rewards for user ${userId}: Plan ${planId}, Cost ${planCost}, Daily earnings ${dailyEarnings}`);
    
    // Check if this plan was already purchased today to prevent duplicate earnings
    console.log(`[PLAN PURCHASE] Checking for existing purchase today...`);
    const alreadyPurchased = await wasPlanPurchasedToday(userId, planId);
    if (alreadyPurchased) {
      console.error(`⚠️ DUPLICATE PREVENTION: Plan ${planId} was already purchased today. Skipping rewards.`);
      return await getUser(userId);
    }
    
    // Mark this plan as purchased today to prevent double earnings - do this FIRST
    console.log(`[PLAN PURCHASE] Marking plan as purchased today to prevent duplicates`);
    await markPlanAsPurchasedToday(userId, planId);
    
    // 1. Add first day's earnings to the user's USDT earnings with plan purchase source
    console.log(`[PLAN PURCHASE] Adding first day's earnings: ${dailyEarnings}`);
    const updatedUser = await updateUsdtEarnings(userId, dailyEarnings, planId, false, 'plan_purchase');
    
    // 2. Award commission to referrers based on plan cost
    console.log(`[PLAN PURCHASE] Awarding commission based on plan cost: ${planCost}`);
    await awardPlanPurchaseCommission(userId, planCost, planId);
    
    // 3. Update the last USDT update date to today to avoid double earnings
    const todayIST = getTodayDateKey();
    console.log(`[PLAN PURCHASE] Updating last USDT earnings date to ${todayIST}`);
    await updateLastUsdtUpdateDate(userId, todayIST);
    
    console.log(`[PLAN PURCHASE] Plan purchase rewards processing completed successfully`);
    return updatedUser;
  } catch (error) {
    console.error("Error processing plan purchase rewards:", error);
    return null;
  }
};
