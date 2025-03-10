
import { 
  db, 
  addUsdtTransaction,
  hasActiveMembership
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
  getDocs
} from 'firebase/firestore';
import { User } from '../storage';
import { notifyReferralCommission } from './notificationService';

// Constants for commission rates
export const REFERRAL_COMMISSION_RATE_LEVEL1 = 0.05; // 5% commission for level 1
export const REFERRAL_COMMISSION_RATE_LEVEL1_PREMIUM = 0.07; // 7% commission for level 1 premium users
export const REFERRAL_COMMISSION_RATE_LEVEL2 = 0.02; // 2% commission for level 2
export const REFERRAL_COMMISSION_RATE_LEVEL3 = 0.01; // 1% commission for level 3
export const REFERRAL_COMMISSION_RATE_LEVEL4 = 0.005; // 0.5% commission for level 4
export const REFERRAL_COMMISSION_RATE_LEVEL5 = 0.005; // 0.5% commission for level 5

// DMI Coin rewards for different levels
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

// Premium plan threshold (in USD)
export const PREMIUM_PLAN_THRESHOLD = 100;

/**
 * Gets the referrer ID for a specific user
 * @param userId ID of the user whose referrer we want to find
 * @returns ID of the referrer or null if not found
 */
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

/**
 * Check if a user has purchased a premium plan ($100+)
 * @param userId ID of the user to check
 * @returns Boolean indicating if the user has a premium plan
 */
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
      
      // Update the referrer's DMI coin balance if there are coins to award
      if (dmiCoinsAmount > 0) {
        const referrerRef = doc(db, 'users', referrerId);
        await updateDoc(referrerRef, {
          balance: increment(dmiCoinsAmount)
        });
        
        console.log(`Awarded ${dmiCoinsAmount} DMI coins to level ${level} referrer ${referrerId}`);
      }
      
      // FIX: Award USDT commission only if they have premium OR active membership
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
      
      // FIX: Award USDT commission only if they have premium OR active membership
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

/**
 * Get commission history for a specific referrer
 * @param referrerId ID of the referrer
 * @returns Array of commission records
 */
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

/**
 * Get total commission earned by a referrer
 * @param referrerId ID of the referrer
 * @returns Total commission amount
 */
export const getTotalCommissionEarned = async (referrerId: string): Promise<number> => {
  try {
    const commissions = await getCommissionHistory(referrerId);
    return commissions.reduce((total, commission) => total + commission.amount, 0);
  } catch (error) {
    console.error("Error calculating total commission:", error);
    return 0;
  }
};

/**
 * Get commission earnings breakdown by level
 * @param referrerId ID of the referrer
 * @returns Object with commission breakdown by level
 */
export const getCommissionBreakdown = async (referrerId: string): Promise<{[key: string]: number}> => {
  try {
    const commissions = await getCommissionHistory(referrerId);
    
    // Initialize breakdown with zero for all levels
    const breakdown = {
      level1: 0,
      level2: 0,
      level3: 0,
      level4: 0,
      level5: 0
    };
    
    // Sum up commissions by level
    commissions.forEach(commission => {
      const level = commission.level || 1; // Default to level 1 if not specified
      
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
