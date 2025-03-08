
import { getTodayDateKey } from '../dateUtils';
import { updateLastUsdtUpdateDate, updateUsdtEarnings } from './tracking';
import { awardPlanPurchaseCommission } from '../referral/commissionAwards';
import { User } from '../../storage';

// New function to update USDT earnings from plan purchase and award referral commission immediately
export const addPlanPurchaseRewards = async (
  userId: string, 
  planCost: number, 
  dailyEarnings: number, 
  planId: string
): Promise<User | null> => {
  try {
    console.log(`Processing plan purchase rewards for user ${userId}: plan ${planId}, cost ${planCost}, daily earnings ${dailyEarnings}`);
    
    // 1. Add first day's earnings to the user's USDT earnings
    const updatedUser = await updateUsdtEarnings(userId, dailyEarnings, planId);
    
    // 2. Award commission to referrers based on plan cost
    console.log(`Awarding immediate referral commission for plan purchase: cost ${planCost}, plan ${planId}`);
    await awardPlanPurchaseCommission(userId, planCost, planId);
    
    // 3. Update the last USDT update date to today to avoid double earnings
    const todayIST = getTodayDateKey();
    await updateLastUsdtUpdateDate(userId, todayIST);
    
    return updatedUser;
  } catch (error) {
    console.error("Error processing plan purchase rewards:", error);
    return null;
  }
};
