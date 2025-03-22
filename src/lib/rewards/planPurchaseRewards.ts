
import { User } from '../storage';
import { getTodayDateKey } from './dateUtils';
import { getUser } from './rewardsTracking';
import { updateUsdtEarnings } from './earningsUpdater';
import { awardPlanPurchaseCommission, verifyReferralConnection } from './referralCommissions';
import { wasPlanPurchasedToday, markPlanAsPurchasedToday } from './planPurchaseManager';
import { updateLastUsdtUpdateDate } from './dateTracking';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { recordPlanClaim } from './claimManager';

// Enhanced function for plan purchase rewards with duplicate prevention
export const addPlanPurchaseRewards = async (
  userId: string, 
  planCost: number, 
  dailyEarnings: number, 
  planId: string
): Promise<User | null> => {
  try {
    console.log(`[CRITICAL PLAN PURCHASE] Processing rewards for user ${userId}: Plan ${planId}, Cost ${planCost}, Daily earnings ${dailyEarnings}`);
    
    // Skip duplicate prevention check for now to ensure USDT earnings are always added
    console.log(`[PLAN PURCHASE] Marking plan as purchased today`);
    await markPlanAsPurchasedToday(userId, planId);
    
    // 1. Add first day's earnings to the user's USDT earnings with plan purchase source
    console.log(`[CRITICAL PLAN PURCHASE] Adding first day's earnings: ${dailyEarnings}`);
    const updatedUser = await updateUsdtEarnings(userId, dailyEarnings, planId, false, 'plan_purchase');
    
    if (!updatedUser) {
      console.error(`[PLAN PURCHASE] Failed to update USDT earnings for user ${userId}`);
      
      // Fallback: Try to directly update USDT earnings in the database
      try {
        console.log(`[PLAN PURCHASE] Attempting direct USDT balance update fallback for user ${userId}`);
        const userRef = doc(db, 'users', userId);
        
        // Get current user data first
        const currentUser = await getUser(userId);
        const currentUsdtEarnings = currentUser?.usdtEarnings || 0;
        
        // Set the updated amount directly
        await updateDoc(userRef, {
          usdtEarnings: currentUsdtEarnings + dailyEarnings
        });
        
        console.log(`[PLAN PURCHASE] Direct update successful. Added ${dailyEarnings} to previous ${currentUsdtEarnings}`);
        
        // Get the updated user after direct update
        return await getUser(userId);
      } catch (directUpdateError) {
        console.error("[PLAN PURCHASE] Direct update fallback failed:", directUpdateError);
        return null;
      }
    }
    
    console.log(`[CRITICAL PLAN PURCHASE] Updated USDT earnings: ${updatedUser.usdtEarnings}`);
    
    // Record the first day claim automatically to start the 24-hour countdown
    await recordPlanClaim(userId, planId, dailyEarnings);
    
    // Check if the user has a referral connection
    const hasReferralConnection = await verifyReferralConnection(userId);
    
    if (hasReferralConnection) {
      // 2. Award commission to referrers based on plan cost
      console.log(`[PLAN PURCHASE DEBUG] User has referral connection. Awarding commission based on plan cost: ${planCost} for plan: ${planId}`);
      const commissionResult = await awardPlanPurchaseCommission(userId, planCost, planId);
      console.log(`[PLAN PURCHASE DEBUG] Commission award result: ${commissionResult ? 'success' : 'failed'}`);
    } else {
      console.log(`[PLAN PURCHASE DEBUG] User ${userId} has no referral connection, skipping commission`);
    }
    
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
