
import { 
  doc, 
  getDoc, 
  updateDoc,
  increment
} from 'firebase/firestore';
import { User } from '../storage';
import { db, addUsdtTransaction } from '../firebase';
import { getUser } from './rewardsTracking';
import { notifyUsdtEarnings } from './notificationService';
import { wasPlanPurchasedToday } from './planPurchaseManager';
import { awardReferralCommission } from './referralCommissions';

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
    
    // Skip duplicate check for plan purchases to ensure earnings are added
    let shouldSkipDuplicateCheck = source === 'plan_purchase';
    
    if (!shouldSkipDuplicateCheck && source === 'plan_purchase' && planId) {
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
    console.log(`[CRITICAL] Attempting to update USDT earnings with amount: ${amount} for user: ${userId}`);
    await updateDoc(userRef, {
      usdtEarnings: increment(amount)
    });
    console.log(`[CRITICAL] USDT increment completed successfully`);
    
    // Verify the update was successful by reading the user data again
    const userAfter = await getDoc(userRef);
    const updatedEarnings = userAfter.data().usdtEarnings || 0;
    console.log(`[CRITICAL] Verified USDT earnings after update: ${updatedEarnings} (expected: ${currentUsdtEarnings + amount})`);
    
    // If the update wasn't successful, try a direct update
    if (updatedEarnings !== currentUsdtEarnings + amount) {
      console.log(`[EARNING FIX] Increment didn't work correctly, trying direct update`);
      try {
        await updateDoc(userRef, {
          usdtEarnings: currentUsdtEarnings + amount
        });
        console.log(`[EARNING FIX] Direct update successful`);
      } catch (directUpdateError) {
        console.error(`[EARNING ERROR] Direct update failed: ${directUpdateError}`);
      }
    }
    
    // Log the transaction with more specific details
    await addUsdtTransaction(
      userId,
      amount,
      'deposit',
      planId ? `Earnings from plan ${planId}` : `Daily plan earnings (${source})`,
      Date.now()
    );
    console.log(`[CRITICAL] Transaction recorded successfully`);
    
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
      console.log(`[EARNING UPDATE] Processing referral commission for earnings: ${amount}`);
      await awardReferralCommission(userId, amount, planId);
    }
    
    // Fetch and return the updated user
    const updatedUser = await getUser(userId);
    console.log(`[EARNING UPDATE] Updated user USDT earnings: ${updatedUser?.usdtEarnings}`);
    
    return updatedUser;
  } catch (error) {
    console.error("Error updating USDT earnings:", error);
    
    // Fallback: Try to directly update USDT earnings in the database
    try {
      console.log(`[EARNING UPDATE] Attempting direct USDT balance update fallback for user ${userId}`);
      const userRef = doc(db, 'users', userId);
      
      // Get current user data first
      const currentUser = await getUser(userId);
      if (!currentUser) {
        console.error("User not found in fallback update");
        return null;
      }
      
      const currentUsdtEarnings = currentUser.usdtEarnings || 0;
      
      // Set the updated amount directly
      await updateDoc(userRef, {
        usdtEarnings: currentUsdtEarnings + amount
      });
      
      console.log(`[EARNING UPDATE] Direct update successful. Added ${amount} to previous ${currentUsdtEarnings}`);
      
      // Log the transaction
      await addUsdtTransaction(
        userId,
        amount,
        'deposit',
        planId ? `Earnings from plan ${planId} (fallback)` : `Daily plan earnings (${source}) (fallback)`,
        Date.now()
      );
      
      // Get the updated user after direct update
      return await getUser(userId);
    } catch (directUpdateError) {
      console.error("[EARNING UPDATE] Direct update fallback failed:", directUpdateError);
      return null;
    }
  }
};
