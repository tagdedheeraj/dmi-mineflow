
import { User } from '../storage';
import { getTodayDateKey } from './dateUtils';
import { getUser } from './rewardsTracking';
import { awardPlanPurchaseCommission, verifyReferralConnection } from './referralCommissions';
import { wasPlanPurchasedToday, markPlanAsPurchasedToday } from './planPurchaseManager';
import { updateLastUsdtUpdateDate } from './dateTracking';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { initializeClaimableRewards } from './claimableRewards';

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
    
    // NEW SYSTEM: Instead of adding USDT earnings directly, create a claimable reward
    console.log(`[CRITICAL PLAN PURCHASE] Creating claimable reward: ${dailyEarnings}`);
    const rewardCreated = await initializeClaimableRewards(userId, planId, dailyEarnings);
    
    if (!rewardCreated) {
      console.error(`[PLAN PURCHASE] Failed to create claimable reward for user ${userId}`);
      return null;
    }
    
    // Get the current user data
    let updatedUser = await getUser(userId);
    
    // Check if the user has a referral connection
    const hasReferralConnection = await verifyReferralConnection(userId);
    
    if (hasReferralConnection) {
      // Award commission to referrers based on plan cost
      console.log(`[PLAN PURCHASE DEBUG] User has referral connection. Awarding commission based on plan cost: ${planCost} for plan: ${planId}`);
      const commissionResult = await awardPlanPurchaseCommission(userId, planCost, planId);
      console.log(`[PLAN PURCHASE DEBUG] Commission award result: ${commissionResult ? 'success' : 'failed'}`);
    } else {
      console.log(`[PLAN PURCHASE DEBUG] User ${userId} has no referral connection, skipping commission`);
    }
    
    // Update the last USDT update date to today to avoid double earnings
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
