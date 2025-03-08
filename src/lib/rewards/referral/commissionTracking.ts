
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../../firebase';

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
