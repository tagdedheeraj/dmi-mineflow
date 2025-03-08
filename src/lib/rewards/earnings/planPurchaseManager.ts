
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { User } from '../../storage';
import { getTodayDateKey } from './dateUtils';
import { updateUsdtEarnings } from './earningsUpdater';
import { updateLastUsdtUpdateDate } from './dateTracking';
import { awardReferralCommission, awardPlanPurchaseCommission } from '../referralCommissions';
import { getUser } from '../rewardsTracking';

/**
 * Checks if a plan was purchased today - with better logging
 */
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

/**
 * Marks a plan as purchased today - with better logging
 */
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

/**
 * Enhanced function for plan purchase rewards with duplicate prevention
 */
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
