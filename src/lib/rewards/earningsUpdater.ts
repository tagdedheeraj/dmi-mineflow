
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
