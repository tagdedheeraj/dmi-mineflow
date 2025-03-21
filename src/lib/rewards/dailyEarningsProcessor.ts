
import { updateLastUsdtUpdateDate } from './dateTracking';
import { wasPlanPurchasedToday } from './planPurchaseManager';
import { getTodayDateKey } from './dateUtils';
import { createClaimableReward } from './claimableRewards';

// Updated processDailyUsdtEarnings with better duplicate prevention and explicit handling of each plan
export const processDailyUsdtEarnings = async (
  userId: string, 
  activePlans: Array<any>, 
  plansData: Array<any>
): Promise<{
  success: boolean;
  totalAmount: number;
  details: {planName: string; amount: number}[];
}> => {
  try {
    // Get today's date in IST (YYYY-MM-DD)
    const todayIST = getTodayDateKey();
    
    console.log(`[DAILY EARNINGS] Processing for user ${userId} (IST time)`);
    console.log(`[DAILY EARNINGS] Today (IST): ${todayIST}`);
    
    // With the new system, we're not creating automatic rewards anymore
    // Instead, users will have to claim rewards manually
    // This function will now just update the last update date
    
    let totalDailyEarnings = 0;
    const earningDetails: {planName: string; amount: number}[] = [];
    
    // Update the last update date to today's IST date
    await updateLastUsdtUpdateDate(userId, todayIST);
    console.log(`[DAILY EARNINGS] Updated last USDT earnings date to ${todayIST} (IST)`);
    
    return {
      success: true,
      totalAmount: 0,
      details: []
    };
  } catch (error) {
    console.error("Error processing daily USDT earnings:", error);
    return {
      success: false,
      totalAmount: 0,
      details: []
    };
  }
};
