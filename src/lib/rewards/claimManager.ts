
import { 
  doc, 
  getDoc, 
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db, addUsdtTransaction } from '../firebase';
import { getUser } from './rewardsTracking';
import { updateUsdtEarnings } from './earningsUpdater';
import { awardPlanPurchaseCommission, verifyReferralConnection } from './referralCommissions';
import { wasPlanPurchasedToday, markPlanAsPurchasedToday } from './planPurchaseManager';
import { updateLastUsdtUpdateDate } from './dateTracking';
// Remove the circular import of recordPlanClaim
// import { recordPlanClaim } from './claimManager';

// Function to check if a plan's earnings can be claimed
export const canClaimPlanEarnings = async (userId: string, planId: string): Promise<boolean> => {
  try {
    console.log(`Checking if user ${userId} can claim earnings for plan ${planId}`);
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error(`User ${userId} does not exist, cannot check claim status`);
      return false;
    }
    
    // Get the claims collection to check last claim time
    const claimsCollection = collection(db, 'plan_claims');
    const q = query(
      claimsCollection,
      where("userId", "==", userId),
      where("planId", "==", planId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // No claims yet, user can claim
      console.log(`No previous claims found for plan ${planId}, user can claim`);
      return true;
    }
    
    // Sort claims by timestamp to get the most recent one
    const claims = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(0)
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    if (claims.length === 0) return true;
    
    const lastClaim = claims[0];
    const lastClaimTime = lastClaim.timestamp;
    const currentTime = new Date();
    
    // Check if 24 hours have passed since last claim
    const hoursSinceLastClaim = (currentTime.getTime() - lastClaimTime.getTime()) / (1000 * 60 * 60);
    console.log(`Hours since last claim for plan ${planId}: ${hoursSinceLastClaim}`);
    
    return hoursSinceLastClaim >= 24;
  } catch (error) {
    console.error("Error checking claim status:", error);
    return false;
  }
};

// Function to record a claim
export const recordPlanClaim = async (userId: string, planId: string, amount: number): Promise<boolean> => {
  try {
    console.log(`Recording claim for plan ${planId} by user ${userId} for amount ${amount}`);
    const claimsCollection = collection(db, 'plan_claims');
    
    await addDoc(claimsCollection, {
      userId,
      planId,
      amount,
      timestamp: serverTimestamp()
    });
    
    console.log(`Recorded claim for plan ${planId} by user ${userId} for amount ${amount}`);
    return true;
  } catch (error) {
    console.error("Error recording claim:", error);
    return false;
  }
};

// Function to get the next available claim time for a plan
export const getNextClaimTime = async (userId: string, planId: string): Promise<Date | null> => {
  try {
    console.log(`Getting next claim time for plan ${planId} by user ${userId}`);
    const claimsCollection = collection(db, 'plan_claims');
    const q = query(
      claimsCollection,
      where("userId", "==", userId),
      where("planId", "==", planId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // No claims yet, can claim now
      console.log(`No claims yet for plan ${planId}, can claim now`);
      return new Date();
    }
    
    // Sort claims by timestamp to get the most recent one
    const claims = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(0)
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    if (claims.length === 0) return new Date();
    
    const lastClaim = claims[0];
    const lastClaimTime = lastClaim.timestamp;
    
    // Calculate next available claim time (24 hours after last claim)
    const nextClaimTime = new Date(lastClaimTime.getTime() + (24 * 60 * 60 * 1000));
    console.log(`Next claim time for plan ${planId}: ${nextClaimTime.toISOString()}`);
    
    return nextClaimTime;
  } catch (error) {
    console.error("Error getting next claim time:", error);
    return null;
  }
};

// Function to claim USDT earnings for a plan
export const claimPlanEarnings = async (userId: string, planId: string, dailyEarnings: number): Promise<boolean> => {
  try {
    console.log(`Attempting to claim ${dailyEarnings} USDT for plan ${planId} by user ${userId}`);
    // Check if user can claim
    const canClaim = await canClaimPlanEarnings(userId, planId);
    
    if (!canClaim) {
      console.log(`User ${userId} cannot claim earnings for plan ${planId} yet`);
      return false;
    }
    
    // Update user's USDT earnings
    const updatedUser = await updateUsdtEarnings(
      userId,
      dailyEarnings,
      planId,
      true,
      'manual_claim'
    );
    
    if (!updatedUser) {
      console.error(`Failed to update USDT earnings for user ${userId}`);
      return false;
    }
    
    // Record the claim
    const claimRecorded = await recordPlanClaim(userId, planId, dailyEarnings);
    if (!claimRecorded) {
      console.error(`Failed to record claim for user ${userId}, plan ${planId}`);
      // We'll continue anyway since the earnings were already added
    }
    
    console.log(`Successfully claimed ${dailyEarnings} USDT for plan ${planId} by user ${userId}`);
    return true;
  } catch (error) {
    console.error("Error claiming plan earnings:", error);
    return false;
  }
};

// Function to get all claims for a user
export const getUserClaims = async (userId: string): Promise<any[]> => {
  try {
    const claimsCollection = collection(db, 'plan_claims');
    const q = query(
      claimsCollection,
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || null
    }));
  } catch (error) {
    console.error("Error getting user claims:", error);
    return [];
  }
};
