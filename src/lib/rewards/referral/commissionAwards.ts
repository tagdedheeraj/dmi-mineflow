
import { 
  doc, 
  updateDoc, 
  collection, 
  addDoc, 
  increment 
} from 'firebase/firestore';
import { db, addUsdtTransaction } from '../../firebase';
import { notifyReferralCommission } from '../notificationService';
import { getReferrerId, hasPremiumPlan } from './helpers';
import { 
  REFERRAL_COMMISSION_RATE_LEVEL1,
  REFERRAL_COMMISSION_RATE_LEVEL1_PREMIUM,
  REFERRAL_COMMISSION_RATE_LEVEL2,
  REFERRAL_COMMISSION_RATE_LEVEL3,
  REFERRAL_COMMISSION_RATE_LEVEL4,
  REFERRAL_COMMISSION_RATE_LEVEL5
} from './constants';

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
      
      // Check if referrer has premium plan
      const isPremium = await hasPremiumPlan(referrerId);
      
      // Determine commission rate based on level and plan type
      let commissionRate = 0;
      
      if (level === 1) {
        commissionRate = isPremium ? REFERRAL_COMMISSION_RATE_LEVEL1_PREMIUM : REFERRAL_COMMISSION_RATE_LEVEL1;
      } else if (level === 2) {
        commissionRate = REFERRAL_COMMISSION_RATE_LEVEL2;
      } else if (level === 3) {
        commissionRate = REFERRAL_COMMISSION_RATE_LEVEL3;
      } else if (level === 4) {
        commissionRate = REFERRAL_COMMISSION_RATE_LEVEL4;
      } else if (level === 5) {
        commissionRate = REFERRAL_COMMISSION_RATE_LEVEL5;
      }
      
      // Calculate the commission amount
      const commissionAmount = earningsAmount * commissionRate;
      
      if (commissionAmount <= 0) {
        console.log(`Commission amount for level ${level} is zero or negative: ${commissionAmount}, skipping`);
        // Continue to next level
        currentUserId = referrerId;
        continue;
      }
      
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
      
      // Move up to the next level
      currentUserId = referrerId;
    }
    
    return true;
  } catch (error) {
    console.error("Error awarding referral commission:", error);
    return false;
  }
};

/**
 * Awards immediate commission to referrers when a user purchases a plan
 * This is separate from daily earnings commission and happens immediately at purchase time
 * @param userId ID of the user who purchased the plan
 * @param planCost Cost of the plan purchased
 * @param planId ID of the plan
 * @returns Whether the commission was successfully awarded
 */
export const awardPlanPurchaseCommission = async (
  userId: string, 
  planCost: number,
  planId: string
): Promise<boolean> => {
  try {
    console.log(`Processing plan purchase commission for user ${userId} with plan cost ${planCost}`);
    
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
      
      // Check if referrer has premium plan
      const isPremium = await hasPremiumPlan(referrerId);
      
      // Determine commission rate based on level and plan type
      let commissionRate = 0;
      
      if (level === 1) {
        commissionRate = isPremium ? REFERRAL_COMMISSION_RATE_LEVEL1_PREMIUM : REFERRAL_COMMISSION_RATE_LEVEL1;
      } else if (level === 2) {
        commissionRate = REFERRAL_COMMISSION_RATE_LEVEL2;
      } else if (level === 3) {
        commissionRate = REFERRAL_COMMISSION_RATE_LEVEL3;
      } else if (level === 4) {
        commissionRate = REFERRAL_COMMISSION_RATE_LEVEL4;
      } else if (level === 5) {
        commissionRate = REFERRAL_COMMISSION_RATE_LEVEL5;
      }
      
      // Calculate the commission amount based on plan cost
      const commissionAmount = planCost * commissionRate;
      
      if (commissionAmount <= 0) {
        console.log(`Commission amount for level ${level} is zero or negative: ${commissionAmount}, skipping`);
        // Continue to next level
        currentUserId = referrerId;
        continue;
      }
      
      console.log(`Awarding ${commissionAmount} USDT commission to level ${level} referrer ${referrerId} for plan purchase`);
      
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
        `Level ${level} referral commission from plan purchase ${planId}`,
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
        isFromPurchase: true,
        baseCost: planCost,
        timestamp: Date.now()
      });
      
      // Send notification to referrer about commission
      await notifyReferralCommission(referrerId, commissionAmount, level);
      
      console.log(`Successfully recorded ${commissionAmount} USDT commission for level ${level} referrer ${referrerId} from plan purchase`);
      
      // Move up to the next level
      currentUserId = referrerId;
    }
    
    return true;
  } catch (error) {
    console.error("Error awarding plan purchase referral commission:", error);
    return false;
  }
};
