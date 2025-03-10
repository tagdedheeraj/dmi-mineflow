
import { 
  doc, 
  getDoc,
  updateDoc, 
  collection, 
  addDoc,
  increment
} from 'firebase/firestore';
import { 
  db, 
  addUsdtTransaction
} from '../../firebase';
import { notifyReferralCommission } from '../notificationService';
import { getReferrerId, hasPremiumPlan, hasActiveMembership } from '../utils/userUtils';
import * as rates from '../constants/referralRates';

/**
 * Awards immediate commission to referrers when a user purchases a plan
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
    console.log(`[DEBUG FIX] Processing plan purchase commission for user ${userId} with plan cost ${planCost}`);
    
    // Current user we're processing
    let currentUserId = userId;
    
    // Process up to 5 levels
    for (let level = 1; level <= 5; level++) {
      // Get the referrer's ID for current user
      const referrerId = await getReferrerId(currentUserId);
      
      if (!referrerId) {
        console.log(`[DEBUG] User ${currentUserId} at level ${level} doesn't have a referrer, stopping chain`);
        break;
      }
      
      // Check if referrer has active membership or premium plan
      const isPremium = await hasPremiumPlan(referrerId);
      const hasActiveM = await hasActiveMembership(referrerId);
      
      console.log(`[DEBUG FIX] Referrer ${referrerId} at level ${level}: isPremium=${isPremium}, hasActiveMembership=${hasActiveM}`);
      
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
      
      // Calculate the commission amount based on plan cost
      const commissionAmount = planCost * commissionRate;
      
      console.log(`[DEBUG FIX] Calculated purchase commission for level ${level}: rate=${commissionRate}, amount=${commissionAmount}`);
      
      if (commissionAmount <= 0) {
        console.log(`[DEBUG] Commission amount for level ${level} is zero or negative: ${commissionAmount}, skipping`);
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
        try {
          const referrerRef = doc(db, 'users', referrerId);
          await updateDoc(referrerRef, {
            balance: increment(dmiCoinsAmount)
          });
          
          console.log(`[DEBUG] Awarded ${dmiCoinsAmount} DMI coins to level ${level} referrer ${referrerId}`);
        } catch (coinError) {
          console.error(`[DEBUG ERROR] Failed to award DMI coins: ${coinError}`);
        }
      }
      
      // Award USDT commission only if they have premium OR active membership
      if (isPremium || hasActiveM) {
        // If we get here, the referrer is eligible for USDT commission
        console.log(`[DEBUG FIX] Awarding ${commissionAmount} USDT commission to level ${level} referrer ${referrerId} for plan purchase`);
        
        try {
          // Update the referrer's USDT earnings
          const referrerRef = doc(db, 'users', referrerId);
          await updateDoc(referrerRef, {
            usdtEarnings: increment(commissionAmount)
          });
          console.log(`[DEBUG FIX] Successfully updated USDT earnings for referrer ${referrerId}`);
        } catch (updateError) {
          console.error(`[DEBUG ERROR] Failed to update USDT earnings: ${updateError}`);
          
          // Try a fallback approach with multiple retries
          let retrySuccess = false;
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              console.log(`[DEBUG] Retry attempt ${attempt} to update USDT earnings`);
              const referrerRef = doc(db, 'users', referrerId);
              const referrerDoc = await getDoc(referrerRef);
              if (referrerDoc.exists()) {
                const currentEarnings = referrerDoc.data().usdtEarnings || 0;
                await updateDoc(referrerRef, {
                  usdtEarnings: currentEarnings + commissionAmount
                });
                console.log(`[DEBUG] Retry ${attempt} successful. Set USDT earnings to ${currentEarnings + commissionAmount}`);
                retrySuccess = true;
                break;
              }
            } catch (retryError) {
              console.error(`[DEBUG ERROR] Retry ${attempt} failed: ${retryError}`);
              if (attempt < 3) {
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 500 * attempt));
              }
            }
          }
          
          if (!retrySuccess) {
            console.error(`[DEBUG CRITICAL] All attempts to update USDT earnings failed for referrer ${referrerId}`);
            // Continue processing other levels even if this update failed
          }
        }
        
        try {
          // Log the transaction
          await addUsdtTransaction(
            referrerId,
            commissionAmount,
            'deposit',
            `Level ${level} referral commission from plan purchase ${planId}`,
            Date.now()
          );
          console.log(`[DEBUG FIX] Transaction recorded for referrer ${referrerId}`);
        } catch (transactionError) {
          console.error(`[DEBUG ERROR] Failed to record transaction: ${transactionError}`);
        }
        
        try {
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
          console.log(`[DEBUG FIX] Commission record added for referrer ${referrerId}`);
        } catch (recordError) {
          console.error(`[DEBUG ERROR] Failed to add commission record: ${recordError}`);
        }
        
        try {
          // Send notification to referrer about commission
          await notifyReferralCommission(referrerId, commissionAmount, level);
          console.log(`[DEBUG] Notification sent to referrer ${referrerId}`);
        } catch (notifyError) {
          console.error(`[DEBUG ERROR] Failed to send notification: ${notifyError}`);
        }
      } else {
        console.log(`[DEBUG FIX] Referrer ${referrerId} doesn't have premium plan or active membership, skipping USDT commission`);
      }
      
      // Move up to the next level
      currentUserId = referrerId;
    }
    
    return true;
  } catch (error) {
    console.error("[DEBUG CRITICAL ERROR] Error awarding plan purchase referral commission:", error);
    return false;
  }
};
