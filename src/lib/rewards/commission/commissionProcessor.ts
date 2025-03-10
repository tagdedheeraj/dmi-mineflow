
import { 
  doc, 
  updateDoc, 
  collection, 
  addDoc,
  increment
} from 'firebase/firestore';
import { 
  db, 
  addUsdtTransaction
} from '../../firebase';
import { User } from '../../storage';
import { notifyReferralCommission } from '../notificationService';
import { getReferrerId, hasPremiumPlan, hasActiveMembership } from '../utils/userUtils';
import * as rates from '../constants/referralRates';

/**
 * Awards commission to a referrer based on the earnings of a referred user
 * @param userId ID of the user who earned profit
 * @param earningsAmount Amount of profit earned
 * @param planId ID of the plan (for tracking purposes)
 * @returns Whether the commission was successfully awarded
 */
export const awardReferralCommission = async (
  userId: string, 
  earningsAmount: number,
  planId: string
): Promise<boolean> => {
  try {
    console.log(`Processing referral commission for user ${userId} with earnings ${earningsAmount}`);
    
    // Current user we're processing
    let currentUserId = userId;
    
    // Process up to 5 levels
    for (let level = 1; level <= 5; level++) {
      // Get the referrer's ID for current user
      const referrerId = await getReferrerId(currentUserId);
      
      if (!referrerId) {
        console.log(`User ${currentUserId} at level ${level} doesn't have a referrer, stopping chain`);
        break;
      }
      
      // Check if referrer has active membership or premium plan
      const isPremium = await hasPremiumPlan(referrerId);
      const hasActiveM = await hasActiveMembership(referrerId);
      
      console.log(`Referrer ${referrerId} at level ${level}: isPremium=${isPremium}, hasActiveMembership=${hasActiveM}`);
      
      // Determine commission rate based on level and plan type
      let commissionRate = 0;
      
      if (level === 1) {
        commissionRate = isPremium ? rates.REFERRAL_COMMISSION_RATE_LEVEL1_PREMIUM : rates.REFERRAL_COMMISSION_RATE_LEVEL1;
      } else if (level === 2) {
        commissionRate = rates.REFERRAL_COMMISSION_RATE_LEVEL2;
      } else if (level === 3) {
        commissionRate = rates.REFERRAL_COMMISSION_RATE_LEVEL3;
      } else if (level === 4) {
        commissionRate = rates.REFERRAL_COMMISSION_RATE_LEVEL4;
      } else if (level === 5) {
        commissionRate = rates.REFERRAL_COMMISSION_RATE_LEVEL5;
      }
      
      // Calculate the commission amount
      const commissionAmount = earningsAmount * commissionRate;
      
      console.log(`Calculated commission for level ${level}: rate=${commissionRate}, amount=${commissionAmount}`);
      
      if (commissionAmount <= 0) {
        console.log(`Commission amount for level ${level} is zero or negative: ${commissionAmount}, skipping`);
        // Continue to next level
        currentUserId = referrerId;
        continue;
      }
      
      // Award DMI coins based on level and premium status (this happens regardless of active membership)
      let dmiCoinsAmount = 0;
      
      if (level === 1) {
        dmiCoinsAmount = isPremium ? rates.REFERRAL_REWARD_COINS_LEVEL1_PREMIUM : rates.REFERRAL_REWARD_COINS_LEVEL1;
      } else if (level === 2) {
        dmiCoinsAmount = isPremium ? rates.REFERRAL_REWARD_COINS_LEVEL2_PREMIUM : rates.REFERRAL_REWARD_COINS_LEVEL2;
      } else if (level === 3) {
        dmiCoinsAmount = isPremium ? rates.REFERRAL_REWARD_COINS_LEVEL3_PREMIUM : rates.REFERRAL_REWARD_COINS_LEVEL3;
      } else if (level === 4) {
        dmiCoinsAmount = isPremium ? rates.REFERRAL_REWARD_COINS_LEVEL4_PREMIUM : rates.REFERRAL_REWARD_COINS_LEVEL4;
      } else if (level === 5) {
        dmiCoinsAmount = isPremium ? rates.REFERRAL_REWARD_COINS_LEVEL5_PREMIUM : rates.REFERRAL_REWARD_COINS_LEVEL5;
      }
      
      // Update the referrer's DMI coin balance if there are coins to award
      if (dmiCoinsAmount > 0) {
        const referrerRef = doc(db, 'users', referrerId);
        await updateDoc(referrerRef, {
          balance: increment(dmiCoinsAmount)
        });
        
        console.log(`Awarded ${dmiCoinsAmount} DMI coins to level ${level} referrer ${referrerId}`);
      }
      
      // Award USDT commission only if they have premium OR active membership
      if (isPremium || hasActiveM) {
        // If we get here, the referrer is eligible for USDT commission
        console.log(`Awarding ${commissionAmount} USDT commission to level ${level} referrer ${referrerId}`);
        
        // Update the referrer's USDT earnings
        const referrerRef = doc(db, 'users', referrerId);
        await updateDoc(referrerRef, {
          usdtEarnings: increment(commissionAmount)
        });
        
        // Log the transaction
        await addUsdtTransaction(
          referrerId,
          commissionAmount,
          'deposit',
          `Level ${level} referral commission from plan ${planId}`,
          Date.now()
        );
        
        // Add commission record
        const commissionsRef = collection(db, 'referral_commissions');
        await addDoc(commissionsRef, {
          referrerId,
          referredId: userId,
          level,
          amount: commissionAmount,
          planId,
          baseEarnings: earningsAmount,
          timestamp: Date.now()
        });
        
        // Send notification to referrer about commission
        await notifyReferralCommission(referrerId, commissionAmount, level);
        
        console.log(`Successfully recorded ${commissionAmount} USDT commission for level ${level} referrer ${referrerId}`);
      } else {
        console.log(`Referrer ${referrerId} doesn't have an active membership or premium plan, skipping USDT commission`);
      }
      
      // Move up to the next level
      currentUserId = referrerId;
    }
    
    return true;
  } catch (error) {
    console.error("Error awarding referral commission:", error);
    return false;
  }
};
