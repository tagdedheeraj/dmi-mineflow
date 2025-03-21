import { 
  doc, 
  getDoc, 
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { getTodayDateKey } from './dateUtils';
import { initializeClaimableRewards } from './claimableRewards';
import { miningPlans } from '@/data/miningPlans';

// Function to check if a plan was purchased today - with better logging
export const wasPlanPurchasedToday = async (userId: string, planId: string): Promise<boolean> => {
  try {
    console.log(`Checking if plan ${planId} was purchased today by user ${userId}`);
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && userDoc.data().recentPlanPurchases) {
      const purchases = userDoc.data().recentPlanPurchases || {};
      const todayIST = getTodayDateKey();
      
      const wasPurchased = purchases[planId] === todayIST;
      console.log(`Plan ${planId} purchase check result: ${wasPurchased ? 'Already purchased today' : 'Not purchased today'}`);
      console.log(`Purchase record: ${purchases[planId]}, Today: ${todayIST}`);
      
      return wasPurchased;
    }
    console.log(`No purchase records found for user ${userId}`);
    return false;
  } catch (error) {
    console.error("Error checking plan purchase date:", error);
    return false;
  }
};

// Function to mark a plan as purchased today - with better logging
export const markPlanAsPurchasedToday = async (userId: string, planId: string): Promise<void> => {
  try {
    console.log(`Marking plan ${planId} as purchased today for user ${userId}`);
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const todayIST = getTodayDateKey();
    
    // Get existing purchases or initialize new object
    const purchases = userDoc.exists() && userDoc.data().recentPlanPurchases 
      ? userDoc.data().recentPlanPurchases : {};
    
    // Add today's purchase
    purchases[planId] = todayIST;
    
    console.log(`Setting purchase record: ${JSON.stringify(purchases)}`);
    
    await updateDoc(userRef, {
      recentPlanPurchases: purchases
    });
    
    console.log(`Successfully marked plan ${planId} as purchased today (${todayIST}) for user ${userId}`);
  } catch (error) {
    console.error("Error marking plan as purchased today:", error);
    throw error; // Rethrow to ensure we know if this critical step fails
  }
};

// Function to handle plan purchase with better logging
export const handlePlanPurchase = async (
  userId: string,
  planId: string,
  transactionId: string
): Promise<boolean> => {
  try {
    console.log(`Processing plan purchase for user ${userId}, plan ${planId}`);
    
    // Find the plan details
    const planDetails = miningPlans.find(plan => plan.id === planId);
    if (!planDetails) {
      console.error(`Plan with ID ${planId} not found`);
      return false;
    }

    // Initialize claimable rewards for this plan
    console.log(`Initializing claimable rewards for user ${userId}, plan ${planId}, daily amount: ${planDetails.dailyEarnings}`);
    const rewardsInitialized = await initializeClaimableRewards(
      userId,
      planId,
      planDetails.dailyEarnings
    );

    if (!rewardsInitialized) {
      console.error(`Failed to initialize claimable rewards for user ${userId}, plan ${planId}`);
    }

    console.log(`Plan purchase processed successfully for user ${userId}, plan ${planId}`);
    return true;
  } catch (error) {
    console.error('Error handling plan purchase:', error);
    return false;
  }
};
