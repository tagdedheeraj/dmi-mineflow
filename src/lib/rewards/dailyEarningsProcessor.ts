
import { updateUsdtEarnings } from './earningsUpdater';
import { getLastUsdtUpdateDate, updateLastUsdtUpdateDate } from './dateTracking';
import { wasPlanPurchasedToday } from './planPurchaseManager';
import { getTodayDateKey } from './dateUtils';

// Updated processDailyUsdtEarnings - now returns plan information but doesn't update USDT
export const processDailyUsdtEarnings = async (
  userId: string, 
  activePlans: Array<any>, 
  plansData: Array<any>
): Promise<{
  success: boolean;
  totalAmount: number;
  details: {planName: string; amount: number; planId: string}[];
}> => {
  try {
    // Get today's date in IST (YYYY-MM-DD)
    const todayIST = getTodayDateKey();
    console.log(`[DAILY EARNINGS] Processing for user ${userId} (IST time)`);
    console.log(`[DAILY EARNINGS] Today (IST): ${todayIST}`);
    
    // We'll still collect information about what plans are eligible,
    // but we won't automatically add the earnings
    let totalDailyEarnings = 0;
    const earningDetails: {planName: string; amount: number; planId: string}[] = [];
    
    // Process active plans that haven't expired
    for (const plan of activePlans) {
      // Skip expired plans
      if (new Date() >= new Date(plan.expiresAt)) {
        console.log(`[DAILY EARNINGS] Plan ${plan.id} has expired, skipping.`);
        continue;
      }
      
      // Get the plan info
      const planInfo = plansData.find((p: any) => p.id === plan.id);
      if (planInfo) {
        console.log(`[DAILY EARNINGS] Found plan info for: ${planInfo.name}, dailyEarnings: ${planInfo.dailyEarnings}`);
        totalDailyEarnings += planInfo.dailyEarnings;
        earningDetails.push({
          planName: planInfo.name,
          amount: planInfo.dailyEarnings,
          planId: plan.id
        });
      } else {
        console.log(`[DAILY EARNINGS] Could not find plan info for id: ${plan.id}`);
      }
    }
    
    // Just return the plan details - we won't automatically update USDT earnings
    if (earningDetails.length > 0) {
      console.log(`[DAILY EARNINGS] Found ${earningDetails.length} active plans eligible for manual claim`);
      
      return {
        success: true,
        totalAmount: totalDailyEarnings,
        details: earningDetails
      };
    } else {
      console.log(`[DAILY EARNINGS] No active plans eligible for claims`);
      
      return {
        success: false,
        totalAmount: 0,
        details: []
      };
    }
  } catch (error) {
    console.error("Error processing daily USDT earnings information:", error);
    return {
      success: false,
      totalAmount: 0,
      details: []
    };
  }
};
