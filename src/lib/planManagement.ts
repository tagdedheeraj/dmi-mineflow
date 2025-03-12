
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
    
    // Force the app to re-fetch data on next load
    window.localStorage.setItem('plansUpdated', 'true');
    window.localStorage.setItem('plansLastUpdated', Date.now().toString());
    window.localStorage.removeItem('cachedPlans');
    
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

// Function to force refresh plans
export const forcePlanRefresh = () => {
  console.log("Forcing plan refresh");
  window.localStorage.removeItem('plansLastUpdated');
  window.localStorage.removeItem('cachedPlans');
};

// Function to update all plans immediately with default values
export const updateFirestoreWithDefaultPlans = async (defaultPlans: MiningPlan[]): Promise<boolean> => {
  try {
    console.log("Immediately updating Firestore with default plans");
    return await updateMiningPlans(defaultPlans);
  } catch (error) {
    console.error("Error updating Firestore with default plans:", error);
    return false;
  }
};
