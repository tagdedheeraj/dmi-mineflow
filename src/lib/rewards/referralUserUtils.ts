
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
    console.log(`[REFERRAL DEBUG] Getting referrer ID for user ${userId}`);
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && userDoc.data().referredBy) {
      console.log(`[REFERRAL DEBUG] Found referrer: ${userDoc.data().referredBy}`);
      return userDoc.data().referredBy;
    }
    
    // Check the applied referral code field as fallback
    if (userDoc.exists() && userDoc.data().appliedReferralCode) {
      console.log(`[REFERRAL DEBUG] Trying to find referrer via applied code: ${userDoc.data().appliedReferralCode}`);
      
      // Find the user with this referral code
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where("referralCode", "==", userDoc.data().appliedReferralCode));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const referrerId = querySnapshot.docs[0].id;
        console.log(`[REFERRAL DEBUG] Found referrer via code: ${referrerId}`);
        return referrerId;
      }
    }
    
    console.log(`[REFERRAL DEBUG] No referrer found for user ${userId}`);
    return null;
  } catch (error) {
    console.error("[REFERRAL ERROR] Error getting referrer ID:", error);
    return null;
  }
};

// Function to check if a user has a premium plan
export const hasPremiumPlan = async (userId: string): Promise<boolean> => {
  try {
    console.log(`[REFERRAL DEBUG] Checking premium plan for user ${userId}`);
    const plansRef = collection(db, 'plans');
    const q = query(
      plansRef, 
      where("userId", "==", userId),
      where("planCost", ">=", 100) // Using constant value directly to avoid circular dependency
    );
    const querySnapshot = await getDocs(q);
    
    const result = !querySnapshot.empty;
    console.log(`[REFERRAL DEBUG] User ${userId} premium plan status: ${result}`);
    return result;
  } catch (error) {
    console.error("[REFERRAL DEBUG] Error checking premium plan:", error);
    return false;
  }
};

// Re-export the hasActiveMembership function from firebase
import { hasActiveMembership as checkActiveMembership } from '../firebase';
export const hasActiveMembership = async (userId: string): Promise<boolean> => {
  try {
    const result = await checkActiveMembership(userId);
    console.log(`[REFERRAL DEBUG] User ${userId} active membership status: ${result}`);
    
    // Always return true for testing if the function is working
    // REMOVE THIS LINE IN PRODUCTION!
    // return true;
    
    return result;
  } catch (error) {
    console.error("[REFERRAL DEBUG] Error checking active membership:", error);
    return false;
  }
};
