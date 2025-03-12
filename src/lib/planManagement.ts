
import { MiningPlan } from '@/data/miningPlans';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// Function to update mining plans in Firestore
export const updateMiningPlans = async (updatedPlans: MiningPlan[]): Promise<boolean> => {
  try {
    console.log("Updating plans in Firestore:", updatedPlans.length);
    
    // Save the updated plans to Firestore
    const plansDocRef = doc(db, 'app_settings', 'mining_plans');
    await setDoc(plansDocRef, { plans: updatedPlans }, { merge: true });
    
    console.log("Plans successfully updated in Firestore");
    
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
    console.log("Attempting to load plans from Firestore...");
    const plansDocRef = doc(db, 'app_settings', 'mining_plans');
    const plansDoc = await getDoc(plansDocRef);
    
    if (plansDoc.exists() && plansDoc.data().plans) {
      const firestorePlans = plansDoc.data().plans as MiningPlan[];
      console.log("Successfully loaded plans from Firestore:", firestorePlans.length);
      return firestorePlans;
    }
    
    console.log("No plans found in Firestore");
    return null;
  } catch (error) {
    console.error("Error loading mining plans from Firestore:", error);
    return null;
  }
};
