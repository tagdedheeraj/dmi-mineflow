
import { collection, addDoc, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase';
import { getReferrerId } from './referralManagement';
import { hasPremiumPlan } from './referralManagement';
import { hasActiveMembership } from '../../firebase';
import { notifyReferralCommission } from '../notificationService';
import { addUsdtTransaction } from '../../firebase';
import * as rates from '../constants/referralRates';

export const awardPlanPurchaseCommission = async (
  userId: string, 
  planCost: number,
  planId: string
): Promise<boolean> => {
  try {
    console.log(`[DEBUG FIX] Processing plan purchase commission for user ${userId} with plan cost ${planCost}`);
    
    let currentUserId = userId;
    
    for (let level = 1; level <= 5; level++) {
      const referrerId = await getReferrerId(currentUserId);
      
      if (!referrerId) {
        console.log(`[DEBUG] User ${currentUserId} at level ${level} doesn't have a referrer, stopping chain`);
        break;
      }
      
      const isPremium = await hasPremiumPlan(referrerId);
      const hasActiveM = await hasActiveMembership(referrerId);
      
      console.log(`[DEBUG FIX] Referrer ${referrerId} at level ${level}: isPremium=${isPremium}, hasActiveMembership=${hasActiveM}`);
      
      let commissionRate = 0;
      let dmiCoinsAmount = 0;
      
      // Determine commission rate and DMI coins based on level
      switch(level) {
        case 1:
          commissionRate = isPremium ? rates.REFERRAL_COMMISSION_RATE_LEVEL1_PREMIUM : rates.REFERRAL_COMMISSION_RATE_LEVEL1;
          dmiCoinsAmount = isPremium ? rates.REFERRAL_REWARD_COINS_LEVEL1_PREMIUM : rates.REFERRAL_REWARD_COINS_LEVEL1;
          break;
        case 2:
          commissionRate = rates.REFERRAL_COMMISSION_RATE_LEVEL2;
          dmiCoinsAmount = isPremium ? rates.REFERRAL_REWARD_COINS_LEVEL2_PREMIUM : rates.REFERRAL_REWARD_COINS_LEVEL2;
          break;
        case 3:
          commissionRate = rates.REFERRAL_COMMISSION_RATE_LEVEL3;
          dmiCoinsAmount = isPremium ? rates.REFERRAL_REWARD_COINS_LEVEL3_PREMIUM : rates.REFERRAL_REWARD_COINS_LEVEL3;
          break;
        case 4:
          commissionRate = rates.REFERRAL_COMMISSION_RATE_LEVEL4;
          dmiCoinsAmount = isPremium ? rates.REFERRAL_REWARD_COINS_LEVEL4_PREMIUM : rates.REFERRAL_REWARD_COINS_LEVEL4;
          break;
        case 5:
          commissionRate = rates.REFERRAL_COMMISSION_RATE_LEVEL5;
          dmiCoinsAmount = isPremium ? rates.REFERRAL_REWARD_COINS_LEVEL5_PREMIUM : rates.REFERRAL_REWARD_COINS_LEVEL5;
          break;
      }
      
      const commissionAmount = planCost * commissionRate;
      
      if (commissionAmount <= 0) {
        console.log(`[DEBUG] Commission amount for level ${level} is zero or negative: ${commissionAmount}, skipping`);
        currentUserId = referrerId;
        continue;
      }
      
      // Award DMI coins
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
      
      // Award USDT commission for eligible referrers
      if (isPremium || hasActiveM) {
        try {
          const referrerRef = doc(db, 'users', referrerId);
          await updateDoc(referrerRef, {
            usdtEarnings: increment(commissionAmount)
          });
          console.log(`[DEBUG FIX] Successfully updated USDT earnings for referrer ${referrerId}`);
          
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
          
          // Send notification
          await notifyReferralCommission(referrerId, commissionAmount, level);
          
        } catch (error) {
          console.error(`[DEBUG ERROR] Failed to process USDT commission: ${error}`);
        }
      } else {
        console.log(`[DEBUG FIX] Referrer ${referrerId} doesn't have premium plan or active membership, skipping USDT commission`);
      }
      
      currentUserId = referrerId;
    }
    
    return true;
  } catch (error) {
    console.error("[DEBUG CRITICAL ERROR] Error awarding plan purchase referral commission:", error);
    return false;
  }
};
