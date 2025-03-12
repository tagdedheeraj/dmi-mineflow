
import { MiningPlan } from '@/data/miningPlans';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// Function to update mining plans in Firestore
export const updateMiningPlans = async (updatedPlans: MiningPlan[]): Promise<boolean> => {
  try {
    console.log("Updating arbitrage plans in Firestore:", updatedPlans);
    
    // Log each plan's details to verify the data before saving
    updatedPlans.forEach(plan => {
      console.log(`Updating plan ${plan.id}: ${plan.name}, Daily Earnings: $${plan.dailyEarnings.toFixed(2)}`);
    });
    
    // Save the updated plans to Firestore
    const plansDocRef = doc(db, 'app_settings', 'mining_plans');
    await setDoc(plansDocRef, { plans: updatedPlans }, { merge: true });
    
    console.log("Arbitrage plans successfully updated in Firestore");
    
    // Since we're storing in Firestore but loading from the local file,
    // we need to refresh the page or implement some way to sync the changes
    // For now, we'll tell the admin that a page refresh is needed
    window.localStorage.setItem('plansUpdated', 'true');
    
    return true;
  } catch (error) {
    console.error("Error updating arbitrage plans:", error);
    throw error;
  }
};

// Function to load plans from Firestore
export const loadMiningPlansFromFirestore = async (): Promise<MiningPlan[] | null> => {
  try {
    console.log("Attempting to load arbitrage plans from Firestore...");
    const plansDocRef = doc(db, 'app_settings', 'mining_plans');
    const plansDoc = await getDoc(plansDocRef);
    
    if (plansDoc.exists() && plansDoc.data().plans) {
      const firestorePlans = plansDoc.data().plans as MiningPlan[];
      console.log("Successfully loaded arbitrage plans from Firestore:", firestorePlans);
      
      // Verify daily earnings for each plan
      firestorePlans.forEach(plan => {
        console.log(`Loaded plan ${plan.id}: ${plan.name}, Daily Earnings: $${plan.dailyEarnings.toFixed(2)}`);
      });
      
      return firestorePlans;
    }
    
    console.log("No arbitrage plans found in Firestore");
    return null;
  } catch (error) {
    console.error("Error loading arbitrage plans from Firestore:", error);
    return null;
  }
};
