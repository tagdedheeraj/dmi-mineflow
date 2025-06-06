
import { 
  collection, 
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';

// Interface for commission breakdown
export interface CommissionBreakdown {
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
}

// Function to get commission history for a referrer
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

// Function to calculate total commission earned by a referrer
export const getTotalCommissionEarned = async (referrerId: string): Promise<number> => {
  try {
    const commissions = await getCommissionHistory(referrerId);
    return commissions.reduce((total, commission) => total + commission.amount, 0);
  } catch (error) {
    console.error("Error calculating total commission:", error);
    return 0;
  }
};

// Function to get commission breakdown by level
export const getCommissionBreakdown = async (referrerId: string): Promise<CommissionBreakdown> => {
  try {
    const commissions = await getCommissionHistory(referrerId);
    
    const breakdown: CommissionBreakdown = {
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
