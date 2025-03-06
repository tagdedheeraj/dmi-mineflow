
import { 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { db, plansCollection } from "../firebase";
import type { ActivePlan } from '../storage';

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
        
        // Set default scheduled update times if not present
        if (!data.lastEarningsUpdate) {
          data.lastEarningsUpdate = data.purchasedAt;
        }
        
        if (!data.nextEarningsUpdate) {
          // Set the next update to either 8 AM or midnight based on purchase time
          const purchaseDate = new Date(data.purchasedAt);
          const next8AM = new Date(purchaseDate);
          next8AM.setHours(8, 0, 0, 0);
          if (purchaseDate >= next8AM) next8AM.setDate(next8AM.getDate() + 1);
          
          const nextMidnight = new Date(purchaseDate);
          nextMidnight.setHours(0, 0, 0, 0);
          nextMidnight.setDate(nextMidnight.getDate() + 1);
          
          // Choose the sooner time
          data.nextEarningsUpdate = (next8AM < nextMidnight) 
            ? next8AM.toISOString() 
            : nextMidnight.toISOString();
        }
        
        return data;
      })
      .filter(plan => new Date(plan.expiresAt) > now);
  } catch (error) {
    console.error("Error fetching active plans:", error);
    return [];
  }
};

export const saveActivePlan = async (userId: string, plan: ActivePlan): Promise<void> => {
  try {
    // Make sure the plan has scheduled update times
    if (!plan.lastEarningsUpdate) {
      plan.lastEarningsUpdate = plan.purchasedAt;
    }
    
    if (!plan.nextEarningsUpdate) {
      // Set the next update to either 8 AM or midnight based on purchase time
      const purchaseDate = new Date(plan.purchasedAt);
      const next8AM = new Date(purchaseDate);
      next8AM.setHours(8, 0, 0, 0);
      if (purchaseDate >= next8AM) next8AM.setDate(next8AM.getDate() + 1);
      
      const nextMidnight = new Date(purchaseDate);
      nextMidnight.setHours(0, 0, 0, 0);
      nextMidnight.setDate(nextMidnight.getDate() + 1);
      
      // Choose the sooner time
      plan.nextEarningsUpdate = (next8AM < nextMidnight) 
        ? next8AM.toISOString() 
        : nextMidnight.toISOString();
    }
    
    await addDoc(plansCollection, {
      ...plan,
      userId,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error saving active plan:", error);
  }
};

export const updatePlanSchedule = async (planId: string, lastUpdate: string, nextUpdate: string): Promise<boolean> => {
  try {
    const planRef = doc(db, 'active_plans', planId);
    await updateDoc(planRef, {
      lastEarningsUpdate: lastUpdate,
      nextEarningsUpdate: nextUpdate
    });
    return true;
  } catch (error) {
    console.error(`Error updating schedule for plan ${planId}:`, error);
    return false;
  }
};

// Helper function to determine the next update time (8 AM or midnight)
export const getNextUpdateTime = (): string => {
  const now = new Date();
  
  // Set up the next 8 AM time
  const next8AM = new Date(now);
  next8AM.setHours(8, 0, 0, 0);
  if (now >= next8AM) next8AM.setDate(next8AM.getDate() + 1);
  
  // Set up the next midnight time
  const nextMidnight = new Date(now);
  nextMidnight.setHours(0, 0, 0, 0);
  nextMidnight.setDate(nextMidnight.getDate() + 1);
  
  // Return the earlier time
  return (next8AM < nextMidnight) ? next8AM.toISOString() : nextMidnight.toISOString();
};
