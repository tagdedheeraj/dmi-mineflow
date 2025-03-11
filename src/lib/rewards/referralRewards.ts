
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db, addUsdtTransaction } from '../firebase';
import { notifyReferralCommission } from './notificationService';
import { getReferrerId, hasPremiumPlan, hasActiveMembership } from './referralUserUtils';
import {
  REFERRAL_COMMISSION_RATE_LEVEL1,
  REFERRAL_COMMISSION_RATE_LEVEL1_PREMIUM,
  REFERRAL_COMMISSION_RATE_LEVEL2,
  REFERRAL_COMMISSION_RATE_LEVEL3,
  REFERRAL_COMMISSION_RATE_LEVEL4,
  REFERRAL_COMMISSION_RATE_LEVEL5,
  REFERRAL_REWARD_COINS_LEVEL1,
  REFERRAL_REWARD_COINS_LEVEL1_PREMIUM,
  REFERRAL_REWARD_COINS_LEVEL2,
  REFERRAL_REWARD_COINS_LEVEL2_PREMIUM,
  REFERRAL_REWARD_COINS_LEVEL3,
  REFERRAL_REWARD_COINS_LEVEL3_PREMIUM,
  REFERRAL_REWARD_COINS_LEVEL4,
  REFERRAL_REWARD_COINS_LEVEL4_PREMIUM,
  REFERRAL_REWARD_COINS_LEVEL5,
  REFERRAL_REWARD_COINS_LEVEL5_PREMIUM
} from './referralConstants';

// Function to award referral commission for plan earnings
export const awardReferralCommission = async (
  userId: string, 
  earningsAmount: number,
  planId: string
): Promise<boolean> => {
  try {
    console.log(`Processing referral commission for user ${userId} with earnings ${earningsAmount}`);
    
    let currentUserId = userId;
    
    for (let level = 1; level <= 5; level++) {
      const referrerId = await getReferrerId(currentUserId);
      
      if (!referrerId) {
        console.log(`User ${currentUserId} at level ${level} doesn't have a referrer, stopping chain`);
        break;
      }
      
      const isPremium = await hasPremiumPlan(referrerId);
      const hasActiveM = await hasActiveMembership(referrerId);
      
      console.log(`Referrer ${referrerId} at level ${level}: isPremium=${isPremium}, hasActiveMembership=${hasActiveM}`);
      
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
      
      const commissionAmount = earningsAmount * commissionRate;
      
      console.log(`Calculated commission for level ${level}: rate=${commissionRate}, amount=${commissionAmount}`);
      
      if (commissionAmount <= 0) {
        console.log(`Commission amount for level ${level} is zero or negative: ${commissionAmount}, skipping`);
        currentUserId = referrerId;
        continue;
      }
      
      let dmiCoinsAmount = 0;
      
      if (level === 1) {
        dmiCoinsAmount = isPremium ? REFERRAL_REWARD_COINS_LEVEL1_PREMIUM : REFERRAL_REWARD_COINS_LEVEL1;
      } else if (level === 2) {
        dmiCoinsAmount = isPremium ? REFERRAL_REWARD_COINS_LEVEL2_PREMIUM : REFERRAL_REWARD_COINS_LEVEL2;
      } else if (level === 3) {
        dmiCoinsAmount = isPremium ? REFERRAL_REWARD_COINS_LEVEL3_PREMIUM : REFERRAL_REWARD_COINS_LEVEL3;
      } else if (level === 4) {
        dmiCoinsAmount = isPremium ? REFERRAL_REWARD_COINS_LEVEL4_PREMIUM : REFERRAL_REWARD_COINS_LEVEL4;
      } else if (level === 5) {
        dmiCoinsAmount = isPremium ? REFERRAL_REWARD_COINS_LEVEL5_PREMIUM : REFERRAL_REWARD_COINS_LEVEL5;
      }
      
      if (dmiCoinsAmount > 0) {
        const referrerRef = doc(db, 'users', referrerId);
        await updateDoc(referrerRef, {
          balance: increment(dmiCoinsAmount)
        });
        
        console.log(`Awarded ${dmiCoinsAmount} DMI coins to level ${level} referrer ${referrerId}`);
      }
      
      if (isPremium || hasActiveM) {
        console.log(`Awarding ${commissionAmount} USDT commission to level ${level} referrer ${referrerId}`);
        
        const referrerRef = doc(db, 'users', referrerId);
        await updateDoc(referrerRef, {
          usdtEarnings: increment(commissionAmount)
        });
        
        await addUsdtTransaction(
          referrerId,
          commissionAmount,
          'deposit',
          `Level ${level} referral commission from plan ${planId}`,
          Date.now()
        );
        
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
        
        await notifyReferralCommission(referrerId, commissionAmount, level);
        
        console.log(`Successfully recorded ${commissionAmount} USDT commission for level ${level} referrer ${referrerId}`);
      } else {
        console.log(`Referrer ${referrerId} doesn't have an active membership or premium plan, skipping USDT commission`);
      }
      
      currentUserId = referrerId;
    }
    
    return true;
  } catch (error) {
    console.error("Error awarding referral commission:", error);
    return false;
  }
};

// Function to award commission for plan purchases
export const awardPlanPurchaseCommission = async (
  userId: string, 
  planCost: number,
  planId: string
): Promise<boolean> => {
  try {
    console.log(`[COMMISSION FIX] Processing plan purchase commission for user ${userId} with plan cost ${planCost}`);
    
    let currentUserId = userId;
    
    for (let level = 1; level <= 5; level++) {
      const referrerId = await getReferrerId(currentUserId);
      
      if (!referrerId) {
        console.log(`[COMMISSION] User ${currentUserId} at level ${level} doesn't have a referrer, stopping chain`);
        break;
      }
      
      const isPremium = await hasPremiumPlan(referrerId);
      const hasActiveM = await hasActiveMembership(referrerId);
      
      console.log(`[COMMISSION FIX] Referrer ${referrerId} at level ${level}: isPremium=${isPremium}, hasActiveMembership=${hasActiveM}`);
      
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
      
      const commissionAmount = planCost * commissionRate;
      
      console.log(`[COMMISSION FIX] Calculated purchase commission for level ${level}: rate=${commissionRate}, amount=${commissionAmount}`);
      
      if (commissionAmount <= 0) {
        console.log(`[COMMISSION] Commission amount for level ${level} is zero or negative: ${commissionAmount}, skipping`);
        currentUserId = referrerId;
        continue;
      }
      
      let dmiCoinsAmount = 0;
      
      if (level === 1) {
        dmiCoinsAmount = isPremium ? REFERRAL_REWARD_COINS_LEVEL1_PREMIUM : REFERRAL_REWARD_COINS_LEVEL1;
      } else if (level === 2) {
        dmiCoinsAmount = isPremium ? REFERRAL_REWARD_COINS_LEVEL2_PREMIUM : REFERRAL_REWARD_COINS_LEVEL2;
      } else if (level === 3) {
        dmiCoinsAmount = isPremium ? REFERRAL_REWARD_COINS_LEVEL3_PREMIUM : REFERRAL_REWARD_COINS_LEVEL3;
      } else if (level === 4) {
        dmiCoinsAmount = isPremium ? REFERRAL_REWARD_COINS_LEVEL4_PREMIUM : REFERRAL_REWARD_COINS_LEVEL4;
      } else if (level === 5) {
        dmiCoinsAmount = isPremium ? REFERRAL_REWARD_COINS_LEVEL5_PREMIUM : REFERRAL_REWARD_COINS_LEVEL5;
      }
      
      if (dmiCoinsAmount > 0) {
        try {
          const referrerRef = doc(db, 'users', referrerId);
          await updateDoc(referrerRef, {
            balance: increment(dmiCoinsAmount)
          });
          
          console.log(`[COMMISSION] Awarded ${dmiCoinsAmount} DMI coins to level ${level} referrer ${referrerId}`);
        } catch (coinError) {
          console.error(`[COMMISSION ERROR] Failed to award DMI coins: ${coinError}`);
        }
      }
      
      try {
        if (isPremium || hasActiveM) {
          console.log(`[COMMISSION FIX] Awarding ${commissionAmount} USDT commission to level ${level} referrer ${referrerId} for plan purchase`);
          
          const referrerDoc = await getDoc(doc(db, 'users', referrerId));
          const currentUsdtEarnings = referrerDoc.exists() ? (referrerDoc.data().usdtEarnings || 0) : 0;
          console.log(`[COMMISSION FIX] Current USDT earnings for referrer ${referrerId}: ${currentUsdtEarnings}`);
          
          try {
            const referrerRef = doc(db, 'users', referrerId);
            await updateDoc(referrerRef, {
              usdtEarnings: increment(commissionAmount)
            });
            console.log(`[COMMISSION FIX] Successfully updated USDT earnings using increment for referrer ${referrerId}`);
          } catch (updateError) {
            console.error(`[COMMISSION ERROR] Failed to update USDT earnings with increment: ${updateError}`);
            
            try {
              const referrerRef = doc(db, 'users', referrerId);
              await updateDoc(referrerRef, {
                usdtEarnings: currentUsdtEarnings + commissionAmount
              });
              console.log(`[COMMISSION FIX] Direct update successful. Set USDT earnings to ${currentUsdtEarnings + commissionAmount}`);
            } catch (directUpdateError) {
              console.error(`[COMMISSION CRITICAL] All USDT update attempts failed: ${directUpdateError}`);
              continue;
            }
          }
          
          await addUsdtTransaction(
            referrerId,
            commissionAmount,
            'deposit',
            `Level ${level} referral commission from plan purchase ${planId}`,
            Date.now()
          );
          
          await addDoc(collection(db, 'referral_commissions'), {
            referrerId,
            referredId: userId,
            level,
            amount: commissionAmount,
            planId,
            isFromPurchase: true,
            baseCost: planCost,
            timestamp: Date.now(),
            createdAt: serverTimestamp()
          });
          
          await notifyReferralCommission(referrerId, commissionAmount, level);
          
          console.log(`[COMMISSION FIX] Successfully processed commission for level ${level} referrer ${referrerId}`);
        } else {
          console.log(`[COMMISSION] Referrer ${referrerId} doesn't have premium plan or active membership, skipping USDT commission`);
        }
      } catch (commissionError) {
        console.error(`[COMMISSION CRITICAL] Error processing commission for level ${level}: ${commissionError}`);
      }
      
      currentUserId = referrerId;
    }
    
    return true;
  } catch (error) {
    console.error("[COMMISSION CRITICAL ERROR] Error awarding plan purchase referral commission:", error);
    return false;
  }
};
