import { 
  db, 
  addUsdtTransaction
} from '../firebase';
import { 
  doc, 
  getDoc, 
  updateDoc,
  increment
} from 'firebase/firestore';
import { User } from '../storage';
import { getTodayDateKey } from './dateUtils';
import { getUser } from './rewardsTracking';
import { awardReferralCommission, awardPlanPurchaseCommission } from './referralCommissions';
import { notifyUsdtEarnings } from './notificationService';

// Function to get the last USDT earnings update date (in IST)
export const getLastUsdtUpdateDate = async (userId: string): Promise<string | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && userDoc.data().lastUsdtEarningsUpdate) {
      return userDoc.data().lastUsdtEarningsUpdate;
    }
    return null;
  } catch (error) {
    console.error("Error getting last USDT update date:", error);
    return null;
  }
};

// Function to check if a plan was purchased today - with better logging
export const wasPlanPurchasedToday = async (userId: string, planId: string): Promise<boolean> => {
  try {
    console.log(`Checking if plan ${planId} was purchased today by user ${userId}`);
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && userDoc.data().recentPlanPurchases) {
      const purchases = userDoc.data().recentPlanPurchases || {};
      const todayIST = getTodayDateKey();
      
      const wasPurchased = purchases[planId] === todayIST;
      console.log(`Plan ${planId} purchase check result: ${wasPurchased ? 'Already purchased today' : 'Not purchased today'}`);
      console.log(`Purchase record: ${purchases[planId]}, Today: ${todayIST}`);
      
      return wasPurchased;
    }
    console.log(`No purchase records found for user ${userId}`);
    return false;
  } catch (error) {
    console.error("Error checking plan purchase date:", error);
    return false;
  }
};

// Function to mark a plan as purchased today - with better logging
export const markPlanAsPurchasedToday = async (userId: string, planId: string): Promise<void> => {
  try {
    console.log(`Marking plan ${planId} as purchased today for user ${userId}`);
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const todayIST = getTodayDateKey();
    
    // Get existing purchases or initialize new object
    const purchases = userDoc.exists() && userDoc.data().recentPlanPurchases 
      ? userDoc.data().recentPlanPurchases : {};
    
    // Add today's purchase
    purchases[planId] = todayIST;
    
    console.log(`Setting purchase record: ${JSON.stringify(purchases)}`);
    
    await updateDoc(userRef, {
      recentPlanPurchases: purchases
    });
    
    console.log(`Successfully marked plan ${planId} as purchased today (${todayIST}) for user ${userId}`);
  } catch (error) {
    console.error("Error marking plan as purchased today:", error);
    throw error; // Rethrow to ensure we know if this critical step fails
  }
};

// Function to update the last USDT earnings update date (using IST date)
export const updateLastUsdtUpdateDate = async (userId: string, date: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastUsdtEarningsUpdate: date
    });
    console.log(`Updated lastUsdtEarningsUpdate for user ${userId} to ${date} (IST)`);
  } catch (error) {
    console.error("Error updating last USDT update date:", error);
  }
};

// Function to update USDT earnings with improved logging and transaction recording
export const updateUsdtEarnings = async (
  userId: string, 
  amount: number, 
  planId?: string, 
  skipReferralCommission: boolean = false,
  source: string = 'earnings'
): Promise<User | null> => {
  try {
    console.log(`[EARNING UPDATE] User: ${userId}, Amount: ${amount}, Plan: ${planId || 'none'}, Source: ${source}`);
    
    // Check if this is a duplicate update (protection against multiple calls)
    if (source === 'plan_purchase' && planId) {
      console.log(`Checking if plan ${planId} was already purchased today to prevent duplicate earnings`);
      const wasPurchased = await wasPlanPurchasedToday(userId, planId);
      if (wasPurchased) {
        console.error(`⚠️ DUPLICATE PREVENTION: Plan ${planId} was already purchased today. Skipping additional earnings.`);
        return await getUser(userId);
      }
    }
    
    const userRef = doc(db, 'users', userId);
    const userBefore = await getDoc(userRef);
    
    if (!userBefore.exists()) {
      console.error(`User ${userId} does not exist, cannot update USDT earnings`);
      return null;
    }
    
    const currentUsdtEarnings = userBefore.data().usdtEarnings || 0;
    console.log(`[EARNING UPDATE] Current: ${currentUsdtEarnings}, Adding: ${amount}, Total: ${currentUsdtEarnings + amount}`);
    
    // Use increment to add the amount to existing USDT earnings
    await updateDoc(userRef, {
      usdtEarnings: increment(amount)
    });
    
    // Log the transaction with more specific details
    await addUsdtTransaction(
      userId,
      amount,
      'deposit',
      planId ? `Earnings from plan ${planId}` : `Daily plan earnings (${source})`,
      Date.now()
    );
    
    // Send notification to user about USDT earnings
    await notifyUsdtEarnings(
      userId, 
      amount, 
      planId ? `plan ${planId}` : 'daily earnings'
    );
    
    console.log(`[EARNING UPDATE] Successfully added ${amount} USDT to user ${userId}'s earnings from ${source}`);
    
    // Process referral commission if this is from a plan and we have a plan ID
    // and we haven't been asked to skip the referral commission
    if (planId && !skipReferralCommission) {
      // Award commission to the referrer (5% of earnings)
      await awardReferralCommission(userId, amount, planId);
    }
    
    // Fetch and return the updated user
    const updatedUser = await getUser(userId);
    console.log(`[EARNING UPDATE] Updated user USDT earnings: ${updatedUser?.usdtEarnings}`);
    
    return updatedUser;
  } catch (error) {
    console.error("Error updating USDT earnings:", error);
    return null;
  }
};

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

// Updated processDailyUsdtEarnings with better duplicate prevention
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
    
    if (totalDailyEarnings > 0) {
      console.log(`[DAILY EARNINGS] Adding total of ${totalDailyEarnings} USDT to user ${userId}'s earnings (IST time update)`);
      
      // Update user's USDT earnings (skip referral commission for daily updates)
      const updatedUser = await updateUsdtEarnings(userId, totalDailyEarnings, undefined, true, 'daily_update');
      
      if (updatedUser) {
        // Update the last update date to today's IST date
        await updateLastUsdtUpdateDate(userId, todayIST);
        console.log(`[DAILY EARNINGS] Updated last USDT earnings date to ${todayIST} (IST)`);
        
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
      console.log(`[DAILY EARNINGS] No earnings to add, updating last update date to ${todayIST} (IST)`);
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
