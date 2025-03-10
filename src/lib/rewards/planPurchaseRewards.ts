
import { User } from '../storage';
import { getTodayDateKey } from './dateUtils';
import { getUser } from './rewardsTracking';
import { updateUsdtEarnings } from './earningsUpdater';
import { awardPlanPurchaseCommission } from './referralCommissions';
import { wasPlanPurchasedToday, markPlanAsPurchasedToday } from './planPurchaseManager';
import { updateLastUsdtUpdateDate } from './dateTracking';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Enhanced function for plan purchase rewards with duplicate prevention
export const addPlanPurchaseRewards = async (
  userId: string, 
  planCost: number, 
  dailyEarnings: number, 
  planId: string
): Promise<User | null> => {
  try {
    console.log(`[CRITICAL PLAN PURCHASE] Processing rewards for user ${userId}: Plan ${planId}, Cost ${planCost}, Daily earnings ${dailyEarnings}`);
    
    // Mark plan as purchased today
    console.log(`[PLAN PURCHASE] Marking plan as purchased today`);
    await markPlanAsPurchasedToday(userId, planId);
    
    // 1. Add first day's earnings to the user's USDT earnings with plan purchase source
    console.log(`[CRITICAL PLAN PURCHASE] Adding first day's earnings: ${dailyEarnings}`);
    let updatedUser = await updateUsdtEarnings(userId, dailyEarnings, planId, false, 'plan_purchase');
    
    if (!updatedUser) {
      console.error(`[PLAN PURCHASE] Failed to update USDT earnings for user ${userId}`);
      
      try {
        console.log(`[PLAN PURCHASE] Attempting direct USDT balance update for user ${userId}`);
        // Get current user data
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const currentUsdtEarnings = userDoc.data().usdtEarnings || 0;
          const newEarnings = currentUsdtEarnings + dailyEarnings;
          
          // Set the updated amount directly
          await updateDoc(userRef, {
            usdtEarnings: newEarnings
          });
          
          console.log(`[PLAN PURCHASE] Direct update successful. Updated earnings from ${currentUsdtEarnings} to ${newEarnings}`);
          
          // Get the updated user
          updatedUser = await getUser(userId);
        }
      } catch (directUpdateError) {
        console.error("[PLAN PURCHASE] Direct update fallback failed:", directUpdateError);
      }
    }
    
    if (updatedUser) {
      console.log(`[CRITICAL PLAN PURCHASE] Updated USDT earnings: ${updatedUser.usdtEarnings}`);
    } else {
      console.error(`[CRITICAL PLAN PURCHASE] Failed to update user after attempts`);
    }
    
    // 2. Award commission to referrers based on plan cost
    console.log(`[PLAN PURCHASE DEBUG] Awarding commission based on plan cost: ${planCost} for plan: ${planId}`);
    const commissionResult = await awardPlanPurchaseCommission(userId, planCost, planId);
    console.log(`[PLAN PURCHASE DEBUG] Commission award result: ${commissionResult ? 'success' : 'failed'}`);
    
    // 3. Update the last USDT update date to today to avoid double earnings
    const todayIST = getTodayDateKey();
    console.log(`[PLAN PURCHASE] Updating last USDT earnings date to ${todayIST}`);
    await updateLastUsdtUpdateDate(userId, todayIST);
    
    console.log(`[PLAN PURCHASE] Plan purchase rewards processing completed successfully`);
    return updatedUser;
  } catch (error) {
    console.error("[PLAN PURCHASE ERROR] Error processing plan purchase rewards:", error);
    return null;
  }
};
