
import { updateUsdtEarnings } from './earningsUpdater';
import { getLastUsdtUpdateDate, updateLastUsdtUpdateDate } from './dateTracking';
import { wasPlanPurchasedToday } from './planPurchaseManager';
import { getTodayDateKey } from './dateUtils';

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
    const lastUpdateDate = await getLastUsdtUpdateDate(userId);
    
    console.log(`[DAILY EARNINGS] Processing for user ${userId} (IST time)`);
    console.log(`[DAILY EARNINGS] Today (IST): ${todayIST}, Last update: ${lastUpdateDate}`);
    console.log(`[DAILY EARNINGS] Active plans:`, activePlans);
    console.log(`[DAILY EARNINGS] Available plans data:`, plansData);
    
    // If already updated today (IST), return without processing
    if (lastUpdateDate === todayIST) {
      console.log(`[DAILY EARNINGS] Already processed earnings for today (${todayIST} IST), skipping.`);
      return {
        success: true,
        totalAmount: 0,
        details: []
      };
    }
    
    let totalDailyEarnings = 0;
    const earningDetails: {planName: string; amount: number}[] = [];
    
    // Process active plans that haven't expired
    for (const plan of activePlans) {
      // Skip expired plans
      if (new Date() >= new Date(plan.expiresAt)) {
        console.log(`[DAILY EARNINGS] Plan ${plan.id} has expired, skipping.`);
        continue;
      }
      
      // Skip plans that were purchased today to avoid double earnings
      const wasPurchasedToday = await wasPlanPurchasedToday(userId, plan.id);
      if (wasPurchasedToday) {
        console.log(`[DAILY EARNINGS] Plan ${plan.id} was purchased today, already received first day earnings, skipping.`);
        continue;
      }
      
      const planInfo = plansData.find((p: any) => p.id === plan.id);
      if (planInfo) {
        console.log(`[DAILY EARNINGS] Processing earnings for plan: ${planInfo.name}, dailyEarnings: ${planInfo.dailyEarnings}`);
        totalDailyEarnings += planInfo.dailyEarnings;
        earningDetails.push({
          planName: planInfo.name,
          amount: planInfo.dailyEarnings
        });
      } else {
        console.log(`[DAILY EARNINGS] Could not find plan info for id: ${plan.id}`);
      }
    }
    
    // Process each plan's earnings individually to ensure proper transaction records and notifications
    if (earningDetails.length > 0) {
      console.log(`[DAILY EARNINGS] Processing individual earnings for ${earningDetails.length} active plans`);
      
      for (const detail of earningDetails) {
        const planInfo = plansData.find((p: any) => p.name === detail.planName);
        if (planInfo) {
          console.log(`[DAILY EARNINGS] Adding ${detail.amount} USDT for plan ${planInfo.name}`);
          
          // Update user's USDT earnings for this specific plan
          await updateUsdtEarnings(
            userId, 
            detail.amount, 
            planInfo.id, 
            true, // Skip referral commission for daily updates
            'daily_update'
          );
        }
      }
      
      // Update the last update date to today's IST date after processing all plans
      await updateLastUsdtUpdateDate(userId, todayIST);
      console.log(`[DAILY EARNINGS] Updated last USDT earnings date to ${todayIST} (IST)`);
      
      return {
        success: true,
        totalAmount: totalDailyEarnings,
        details: earningDetails
      };
    } else {
      // Even if there are no earnings, update the date to avoid checking again today
      console.log(`[DAILY EARNINGS] No earnings to add, updating last update date to ${todayIST} (IST)`);
      await updateLastUsdtUpdateDate(userId, todayIST);
      
      return {
        success: false,
        totalAmount: 0,
        details: []
      };
    }
  } catch (error) {
    console.error("Error processing daily USDT earnings:", error);
    return {
      success: false,
      totalAmount: 0,
      details: []
    };
  }
};
