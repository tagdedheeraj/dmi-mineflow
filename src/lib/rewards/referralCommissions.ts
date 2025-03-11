import { 
  db, 
  addUsdtTransaction,
  hasActiveMembership as checkActiveMembership
} from '../firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc,
  increment,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { User } from '../storage';
import { notifyReferralCommission } from './notificationService';

export const hasActiveMembership = checkActiveMembership;

export const REFERRAL_COMMISSION_RATE_LEVEL1 = 0.05; // 5% commission for level 1
export const REFERRAL_COMMISSION_RATE_LEVEL1_PREMIUM = 0.07; // 7% commission for level 1 premium users
export const REFERRAL_COMMISSION_RATE_LEVEL2 = 0.02; // 2% commission for level 2
export const REFERRAL_COMMISSION_RATE_LEVEL3 = 0.01; // 1% commission for level 3
export const REFERRAL_COMMISSION_RATE_LEVEL4 = 0.005; // 0.5% commission for level 4
export const REFERRAL_COMMISSION_RATE_LEVEL5 = 0.005; // 0.5% commission for level 5

export const REFERRAL_REWARD_COINS_LEVEL1 = 200;
export const REFERRAL_REWARD_COINS_LEVEL1_PREMIUM = 200;
export const REFERRAL_REWARD_COINS_LEVEL2 = 50;
export const REFERRAL_REWARD_COINS_LEVEL2_PREMIUM = 100;
export const REFERRAL_REWARD_COINS_LEVEL3 = 10;
export const REFERRAL_REWARD_COINS_LEVEL3_PREMIUM = 50;
export const REFERRAL_REWARD_COINS_LEVEL4 = 0;
export const REFERRAL_REWARD_COINS_LEVEL4_PREMIUM = 30;
export const REFERRAL_REWARD_COINS_LEVEL5 = 0;
export const REFERRAL_REWARD_COINS_LEVEL5_PREMIUM = 10;

export const PREMIUM_PLAN_THRESHOLD = 100;

export const getReferrerId = async (userId: string): Promise<string | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && userDoc.data().referredBy) {
      return userDoc.data().referredBy;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting referrer ID:", error);
    return null;
  }
};

export const hasPremiumPlan = async (userId: string): Promise<boolean> => {
  try {
    console.log(`[DEBUG] Checking premium plan for user ${userId}`);
    const plansRef = collection(db, 'plans');
    const q = query(
      plansRef, 
      where("userId", "==", userId),
      where("planCost", ">=", PREMIUM_PLAN_THRESHOLD)
    );
    const querySnapshot = await getDocs(q);
    
    const result = !querySnapshot.empty;
    console.log(`[DEBUG] User ${userId} premium plan status: ${result}`);
    return result;
  } catch (error) {
    console.error("[DEBUG] Error checking premium plan:", error);
    return false;
  }
};

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
      const hasActiveM = await checkActiveMembership(referrerId);
      
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
      const hasActiveM = await checkActiveMembership(referrerId);
      
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

export const getCommissionHistory = async (referrerId: string): Promise<any[]> => {
  try {
    const commissionsRef = collection(db, 'referral_commissions');
    const q = query(commissionsRef, where("referrerId", "==", referrerId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting commission history:", error);
    return [];
  }
};

export const getTotalCommissionEarned = async (referrerId: string): Promise<number> => {
  try {
    const commissions = await getCommissionHistory(referrerId);
    return commissions.reduce((total, commission) => total + commission.amount, 0);
  } catch (error) {
    console.error("Error calculating total commission:", error);
    return 0;
  }
};

export const getCommissionBreakdown = async (referrerId: string): Promise<{[key: string]: number}> => {
  try {
    const commissions = await getCommissionHistory(referrerId);
    
    const breakdown = {
      level1: 0,
      level2: 0,
      level3: 0,
      level4: 0,
      level5: 0
    };
    
    commissions.forEach(commission => {
      const level = commission.level || 1;
      
      if (level === 1) breakdown.level1 += commission.amount;
      else if (level === 2) breakdown.level2 += commission.amount;
      else if (level === 3) breakdown.level3 += commission.amount;
      else if (level === 4) breakdown.level4 += commission.amount;
      else if (level === 5) breakdown.level5 += commission.amount;
    });
    
    return breakdown;
  } catch (error) {
    console.error("Error calculating commission breakdown:", error);
    return { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0 };
  }
};
