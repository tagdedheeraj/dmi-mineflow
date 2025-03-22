
import { 
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';

// Function to check if a plan's earnings can be claimed
export const canClaimPlanEarnings = async (userId: string, planId: string): Promise<boolean> => {
  try {
    console.log(`Checking if user ${userId} can claim earnings for plan ${planId}`);
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
