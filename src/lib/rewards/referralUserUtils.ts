
import { 
  doc, 
  getDoc, 
  collection, 
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';

// Function to get the referrer ID of a user
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

// Function to check if a user has a premium plan
export const hasPremiumPlan = async (userId: string): Promise<boolean> => {
  try {
    console.log(`[DEBUG] Checking premium plan for user ${userId}`);
    const plansRef = collection(db, 'plans');
    const q = query(
      plansRef, 
      where("userId", "==", userId),
      where("planCost", ">=", 100) // Using constant value directly to avoid circular dependency
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

// Re-export the hasActiveMembership function from firebase
import { hasActiveMembership as checkActiveMembership } from '../firebase';
export const hasActiveMembership = checkActiveMembership;
