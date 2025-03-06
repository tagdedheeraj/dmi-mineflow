
import { 
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import type { ActivePlan } from '../storage';

// Plans operations
export const getActivePlans = async (userId: string): Promise<ActivePlan[]> => {
  try {
    const plansCollection = collection(db, 'plans');
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
    const plansCollection = collection(db, 'plans');
    await addDoc(plansCollection, {
      ...plan,
      userId,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error saving active plan:", error);
  }
};
