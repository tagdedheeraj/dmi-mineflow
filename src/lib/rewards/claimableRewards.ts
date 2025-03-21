
import { 
  db,
  auth,
} from '../firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { ActivePlan } from '../storage';
import { getUser, updateUserBalance } from './rewardsTracking';
import { miningPlans } from '@/data/miningPlans';
import { getTodayDateKey } from './dateUtils';

// Interface for claimable reward
export interface ClaimableReward {
  id?: string;
  userId: string;
  planId: string;
  planName: string;
  amount: number;
  createdAt: Date;
  claimableAt: Date;
  claimed: boolean;
  claimedAt?: Date;
}

// Get all claimable rewards for a user
export const getUserClaimableRewards = async (userId: string): Promise<ClaimableReward[]> => {
  try {
    const rewardsRef = collection(db, 'claimableRewards');
    const q = query(rewardsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const rewards: ClaimableReward[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      rewards.push({
        id: doc.id,
        userId: data.userId,
        planId: data.planId,
        planName: data.planName,
        amount: data.amount,
        createdAt: data.createdAt.toDate(),
        claimableAt: data.claimableAt.toDate(),
        claimed: data.claimed,
        claimedAt: data.claimedAt ? data.claimedAt.toDate() : undefined
      });
    });
    
    return rewards;
  } catch (error) {
    console.error("Error fetching claimable rewards:", error);
    return [];
  }
};

// Get unclaimed rewards that are claimable now
export const getClaimableRewards = async (userId: string): Promise<ClaimableReward[]> => {
  try {
    const allRewards = await getUserClaimableRewards(userId);
    const now = new Date();
    
    return allRewards.filter(reward => 
      !reward.claimed && new Date(reward.claimableAt) <= now
    );
  } catch (error) {
    console.error("Error fetching claimable rewards:", error);
    return [];
  }
};

// Create a new claimable reward
export const createClaimableReward = async (
  userId: string,
  planId: string,
  planName: string,
  amount: number,
  claimableAt?: Date
): Promise<ClaimableReward | null> => {
  try {
    // If claimableAt is not provided, make it claimable immediately
    const claimTime = claimableAt || new Date();
    
    const rewardData = {
      userId,
      planId,
      planName,
      amount,
      createdAt: Timestamp.fromDate(new Date()),
      claimableAt: Timestamp.fromDate(claimTime),
      claimed: false
    };
    
    const rewardsRef = collection(db, 'claimableRewards');
    const docRef = await addDoc(rewardsRef, rewardData);
    
    console.log(`Created claimable reward: ${docRef.id} for plan ${planId}, amount: ${amount}`);
    
    return {
      id: docRef.id,
      ...rewardData,
      createdAt: new Date(),
      claimableAt: claimTime,
    };
  } catch (error) {
    console.error("Error creating claimable reward:", error);
    return null;
  }
};

// Create the next claimable reward after claiming the current one
export const createNextClaimableReward = async (
  userId: string,
  planId: string,
  planName: string,
  amount: number
): Promise<ClaimableReward | null> => {
  try {
    // Set next claimable time to 24 hours from now
    const nextClaimTime = new Date();
    nextClaimTime.setHours(nextClaimTime.getHours() + 24);
    
    return await createClaimableReward(userId, planId, planName, amount, nextClaimTime);
  } catch (error) {
    console.error("Error creating next claimable reward:", error);
    return null;
  }
};

// Claim a reward
export const claimReward = async (rewardId: string): Promise<boolean> => {
  try {
    const rewardRef = doc(db, 'claimableRewards', rewardId);
    const rewardDoc = await getDoc(rewardRef);
    
    if (!rewardDoc.exists()) {
      console.error(`Reward with ID ${rewardId} does not exist`);
      return false;
    }
    
    const rewardData = rewardDoc.data() as ClaimableReward;
    
    if (rewardData.claimed) {
      console.error(`Reward with ID ${rewardId} has already been claimed`);
      return false;
    }
    
    const now = new Date();
    if (new Date(rewardData.claimableAt.toString()) > now) {
      console.error(`Reward with ID ${rewardId} is not yet claimable`);
      return false;
    }
    
    // Update user balance
    const updatedUser = await updateUserBalance(rewardData.userId, rewardData.amount);
    
    if (!updatedUser) {
      console.error(`Failed to update balance for user ${rewardData.userId}`);
      return false;
    }
    
    // Mark reward as claimed
    await updateDoc(rewardRef, {
      claimed: true,
      claimedAt: Timestamp.fromDate(now)
    });
    
    // Create next claimable reward
    await createNextClaimableReward(
      rewardData.userId,
      rewardData.planId,
      rewardData.planName,
      rewardData.amount
    );
    
    console.log(`Claimed reward ${rewardId} for user ${rewardData.userId}, amount: ${rewardData.amount}`);
    return true;
  } catch (error) {
    console.error("Error claiming reward:", error);
    return false;
  }
};

// Initialize claimable rewards for a new plan
export const initializeClaimableRewards = async (
  userId: string,
  planId: string,
  dailyAmount: number
): Promise<boolean> => {
  try {
    // Find plan info
    const planInfo = miningPlans.find(p => p.id === planId);
    
    if (!planInfo) {
      console.error(`Plan with ID ${planId} not found`);
      return false;
    }
    
    // Create immediate reward (first day's earnings)
    await createClaimableReward(
      userId,
      planId,
      planInfo.name,
      dailyAmount
    );
    
    console.log(`Initialized claimable rewards for user ${userId}, plan ${planId}`);
    return true;
  } catch (error) {
    console.error("Error initializing claimable rewards:", error);
    return false;
  }
};

// Get time remaining until next claim (in seconds)
export const getTimeUntilNextClaim = async (userId: string, planId: string): Promise<number> => {
  try {
    const rewardsRef = collection(db, 'claimableRewards');
    const q = query(
      rewardsRef, 
      where('userId', '==', userId),
      where('planId', '==', planId),
      where('claimed', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return 0; // No pending rewards
    }
    
    let earliestClaimTime: Date | null = null;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const claimableAt = data.claimableAt.toDate();
      
      if (earliestClaimTime === null || claimableAt < earliestClaimTime) {
        earliestClaimTime = claimableAt;
      }
    });
    
    if (earliestClaimTime === null) {
      return 0;
    }
    
    const now = new Date();
    const diffInSeconds = Math.max(0, Math.floor((earliestClaimTime.getTime() - now.getTime()) / 1000));
    
    return diffInSeconds;
  } catch (error) {
    console.error("Error calculating time until next claim:", error);
    return 0;
  }
};
