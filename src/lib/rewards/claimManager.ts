
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { updateUsdtEarnings } from './earningsUpdater';

// Get the next time a user can claim USDT for a specific plan
export const getNextClaimTime = async (userId: string, planId: string): Promise<Date | null> => {
  try {
    const claimRef = doc(db, 'users', userId, 'plan_claims', planId);
    const claimDoc = await getDoc(claimRef);
    
    if (claimDoc.exists() && claimDoc.data().nextClaimTime) {
      return claimDoc.data().nextClaimTime.toDate();
    }
    
    return null; // No claim record exists yet, can claim immediately
  } catch (error) {
    console.error(`Error getting next claim time for plan ${planId}:`, error);
    return null;
  }
};

// Process a USDT claim for a specific plan
export const claimPlanUsdtEarnings = async (
  userId: string, 
  planId: string, 
  amount: number
): Promise<{success: boolean; newUsdtBalance?: number; nextClaimTime?: Date}> => {
  try {
    console.log(`[CLAIM] Processing USDT claim for user ${userId}, plan ${planId}, amount ${amount}`);
    
    // 1. Check if the user can claim (already handled in UI but double-check)
    const nextClaimTime = await getNextClaimTime(userId, planId);
    if (nextClaimTime && new Date() < nextClaimTime) {
      console.log(`[CLAIM] User ${userId} tried to claim before allowed time`);
      return { 
        success: false,
      };
    }
    
    // 2. Update the user's USDT balance
    const updatedUser = await updateUsdtEarnings(userId, amount);
    
    if (!updatedUser) {
      console.log(`[CLAIM] Failed to update USDT earnings for user ${userId}`);
      return { success: false };
    }
    
    // 3. Set the next claim time (24 hours from now)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(now.getHours() + 24);
    
    const claimRef = doc(db, 'users', userId, 'plan_claims', planId);
    await setDoc(claimRef, {
      lastClaimTime: Timestamp.fromDate(now),
      nextClaimTime: Timestamp.fromDate(tomorrow),
      amount: amount,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    console.log(`[CLAIM] Successfully processed claim for user ${userId}, plan ${planId}`);
    console.log(`[CLAIM] Next claim time set to ${tomorrow.toISOString()}`);
    
    return { 
      success: true, 
      newUsdtBalance: updatedUser.usdtEarnings,
      nextClaimTime: tomorrow
    };
  } catch (error) {
    console.error(`[CLAIM] Error processing USDT claim for plan ${planId}:`, error);
    return { success: false };
  }
};
