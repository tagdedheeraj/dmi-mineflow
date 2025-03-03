
import { 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} from "firebase/firestore";
import { db, plansCollection } from "./config";
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
    await addDoc(plansCollection, {
      ...plan,
      userId,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error saving active plan:", error);
  }
};
