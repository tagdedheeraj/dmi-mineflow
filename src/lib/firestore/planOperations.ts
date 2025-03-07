
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  db
} from "./core";
import type { ActivePlan } from '../storage';
import { addUsdtTransaction } from './usdtTransactions';

// Collection references
export const plansCollection = collection(db, 'plans');

// Plans operations
export const getActivePlans = async (userId: string): Promise<ActivePlan[]> => {
  try {
    const q = query(plansCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const now = new Date();
    return querySnapshot.docs
      .map(doc => {
        const data = doc.data() as ActivePlan;
        data.id = doc.id;
        return data;
      })
      .filter(plan => new Date(plan.expiresAt) > now);
  } catch (error) {
    console.error("Error fetching active plans:", error);
    return [];
  }
};

export const saveActivePlan = async (userId: string, plan: ActivePlan): Promise<string | null> => {
  try {
    const docRef = await addDoc(plansCollection, {
      ...plan,
      userId,
      createdAt: serverTimestamp()
    });
    
    // Record the purchase as a USDT transaction
    if (plan.planCost) {
      await addUsdtTransaction(
        userId,
        -plan.planCost, // Negative amount for payment
        'deposit',
        `Purchase of ${plan.planName} plan`,
        Date.now()
      );
    }
    
    return docRef.id;
  } catch (error) {
    console.error("Error saving active plan:", error);
    return null;
  }
};

// Get user's purchased plans (for referral commission calculations)
export const getUserPurchasedPlans = async (userId: string): Promise<ActivePlan[]> => {
  try {
    const q = query(plansCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as ActivePlan;
      data.id = doc.id;
      return data;
    });
  } catch (error) {
    console.error("Error fetching user's purchased plans:", error);
    return [];
  }
};

// Calculate if user has premium plan for referral benefits
export const hasUserPurchasedPremiumPlan = async (userId: string, premiumThreshold = 100): Promise<boolean> => {
  try {
    const plans = await getUserPurchasedPlans(userId);
    return plans.some(plan => (plan.planCost || 0) >= premiumThreshold);
  } catch (error) {
    console.error("Error checking premium plan status:", error);
    return false;
  }
};
