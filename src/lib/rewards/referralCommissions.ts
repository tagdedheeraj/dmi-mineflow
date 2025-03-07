
import { 
  db, 
  addUsdtTransaction 
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

// Constants for commission rates
export const REFERRAL_COMMISSION_RATE = 0.05; // 5% commission on earnings

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
    
    // Get the referrer's ID
    const referrerId = await getReferrerId(userId);
    
    if (!referrerId) {
      console.log(`User ${userId} doesn't have a referrer, no commission to award`);
      return false;
    }
    
    // Calculate the commission amount (5% of earnings)
    const commissionAmount = earningsAmount * REFERRAL_COMMISSION_RATE;
    
    if (commissionAmount <= 0) {
      console.log(`Commission amount is zero or negative: ${commissionAmount}, skipping`);
      return false;
    }
    
    console.log(`Awarding ${commissionAmount} USDT commission to referrer ${referrerId}`);
    
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
      `Referral commission from plan ${planId}`,
      Date.now()
    );
    
    // Add commission record
    const commissionsRef = collection(db, 'referral_commissions');
    await addDoc(commissionsRef, {
      referrerId,
      referredId: userId,
      amount: commissionAmount,
      planId,
      baseEarnings: earningsAmount,
      timestamp: Date.now()
    });
    
    console.log(`Successfully recorded ${commissionAmount} USDT commission for referrer ${referrerId}`);
    return true;
  } catch (error) {
    console.error("Error awarding referral commission:", error);
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
