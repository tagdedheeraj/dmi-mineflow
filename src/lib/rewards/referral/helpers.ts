
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { PREMIUM_PLAN_THRESHOLD } from './constants';

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
    const plansRef = collection(db, 'plans');
    const q = query(
      plansRef, 
      where("userId", "==", userId),
      where("planCost", ">=", PREMIUM_PLAN_THRESHOLD)
    );
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking premium plan:", error);
    return false;
  }
};
