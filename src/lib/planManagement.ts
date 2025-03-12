
import { MiningPlan } from '@/data/miningPlans';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// Function to update mining plans in Firestore
export const updateMiningPlans = async (updatedPlans: MiningPlan[]): Promise<boolean> => {
  try {
    // Save the updated plans to Firestore
    const plansDocRef = doc(db, 'app_settings', 'mining_plans');
    await setDoc(plansDocRef, { plans: updatedPlans }, { merge: true });
    
    // Since we're storing in Firestore but loading from the local file,
    // we need to refresh the page or implement some way to sync the changes
    // For now, we'll tell the admin that a page refresh is needed
    window.localStorage.setItem('plansUpdated', 'true');
    
    return true;
  } catch (error) {
    console.error("Error updating mining plans:", error);
    throw error;
  }
};

// Function to load plans from Firestore
export const loadMiningPlansFromFirestore = async (): Promise<MiningPlan[] | null> => {
  try {
    const plansDocRef = doc(db, 'app_settings', 'mining_plans');
    const plansDoc = await getDoc(plansDocRef);
    
    if (plansDoc.exists() && plansDoc.data().plans) {
      return plansDoc.data().plans as MiningPlan[];
    }
    return null;
  } catch (error) {
    console.error("Error loading mining plans from Firestore:", error);
    return null;
  }
};
