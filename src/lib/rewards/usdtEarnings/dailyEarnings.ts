
import { getLastUsdtUpdateDate, updateLastUsdtUpdateDate, updateUsdtEarnings } from './tracking';
import { getTodayDateKey } from '../dateUtils';

// Enhanced function to process daily USDT earnings with better error handling
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
    
    console.log(`Processing daily USDT earnings for user ${userId} (IST time)`);
    console.log(`Today (IST): ${todayIST}, Last update: ${lastUpdateDate}`);
    
    // If already updated today (IST), return without processing
    if (lastUpdateDate === todayIST) {
      console.log(`Already processed earnings for today (${todayIST} IST), skipping.`);
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
        console.log(`Plan ${plan.id} has expired, skipping.`);
        continue;
      }
      
      const planInfo = plansData.find((p: any) => p.id === plan.id);
      if (planInfo) {
        console.log(`Processing earnings for plan: ${planInfo.name}, dailyEarnings: ${planInfo.dailyEarnings}`);
        totalDailyEarnings += planInfo.dailyEarnings;
        earningDetails.push({
          planName: planInfo.name,
          amount: planInfo.dailyEarnings
        });
      } else {
        console.log(`Could not find plan info for id: ${plan.id}`);
      }
    }
    
    if (totalDailyEarnings > 0) {
      console.log(`Adding total of ${totalDailyEarnings} USDT to user ${userId}'s earnings (IST time update)`);
      
      // Update user's USDT earnings
      const updatedUser = await updateUsdtEarnings(userId, totalDailyEarnings);
      
      if (updatedUser) {
        // Update the last update date to today's IST date
        await updateLastUsdtUpdateDate(userId, todayIST);
        console.log(`Updated last USDT earnings date to ${todayIST} (IST)`);
        
        return {
          success: true,
          totalAmount: totalDailyEarnings,
          details: earningDetails
        };
      } else {
        throw new Error("Failed to update user's USDT earnings");
      }
    } else {
      // Even if there are no earnings, update the date to avoid checking again today
      console.log(`No earnings to add, updating last update date to ${todayIST} (IST)`);
      await updateLastUsdtUpdateDate(userId, todayIST);
    }
    
    return {
      success: totalDailyEarnings > 0,
      totalAmount: totalDailyEarnings,
      details: earningDetails
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
