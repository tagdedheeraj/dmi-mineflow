
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
  addDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { ActivePlan } from '../storage';
import { getUser, updateUserBalance } from './rewardsTracking';
import { miningPlans } from '@/data/miningPlans';
import { getTodayDateKey } from './dateUtils';
import { addUsdtTransaction } from '../firebase';

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
    console.log("Getting all rewards for user:", userId);
    const rewardsRef = collection(db, 'claimableRewards');
    const q = query(
      rewardsRef, 
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.size} rewards in the database`);
    
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
    
    console.log("Processed rewards:", rewards);
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
    
    const claimableRewards = allRewards.filter(reward => 
      !reward.claimed && new Date(reward.claimableAt) <= now
    );
    
    console.log(`Found ${claimableRewards.length} claimable rewards for user ${userId}`);
    return claimableRewards;
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
    
    console.log(`Claiming reward ${rewardId} for user ${rewardData.userId}, amount: ${rewardData.amount}`);
    
    // Update user balance
    const updatedUser = await updateUserBalance(rewardData.userId, rewardData.amount);
    
    if (!updatedUser) {
      console.error(`Failed to update balance for user ${rewardData.userId}`);
      return false;
    }
    
    // Add transaction record
    await addUsdtTransaction(
      rewardData.userId,
      rewardData.amount,
      'deposit',
      `Daily reward from ${rewardData.planName}`,
      Date.now()
    );
    
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
    
    console.log(`Successfully claimed reward ${rewardId}`);
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
    
    console.log(`Initializing claimable rewards for user ${userId}, plan ${planId} with daily amount ${dailyAmount}`);
    
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

// Check if a user has claimable rewards for a specific plan
export const hasClaimableRewardsForPlan = async (userId: string, planId: string): Promise<boolean> => {
  try {
    const rewardsRef = collection(db, 'claimableRewards');
    const q = query(
      rewardsRef,
      where('userId', '==', userId),
      where('planId', '==', planId)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking for claimable rewards:", error);
    return false;
  }
};

// Get time remaining until next claim (in seconds)
export const getTimeUntilNextClaim = async (userId: string, planId: string): Promise<number> => {
  try {
    console.log(`Checking time until next claim for user ${userId}, plan ${planId}`);
    
    const rewardsRef = collection(db, 'claimableRewards');
    const q = query(
      rewardsRef, 
      where('userId', '==', userId),
      where('planId', '==', planId),
      where('claimed', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log("No pending rewards found");
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
    
    console.log(`Time until next claim: ${diffInSeconds} seconds`);
    return diffInSeconds;
  } catch (error) {
    console.error("Error calculating time until next claim:", error);
    return 0;
  }
};

// Debug function to check the state of claimable rewards
export const getClaimableRewardsDebugInfo = async (userId: string): Promise<any> => {
  try {
    const allRewards = await getUserClaimableRewards(userId);
    const claimable = await getClaimableRewards(userId);
    
    // Group rewards by plan
    const rewardsByPlan: Record<string, any[]> = {};
    allRewards.forEach(reward => {
      if (!rewardsByPlan[reward.planId]) {
        rewardsByPlan[reward.planId] = [];
      }
      rewardsByPlan[reward.planId].push(reward);
    });
    
    // Get countdowns for each plan
    const countdowns: Record<string, number> = {};
    for (const planId of Object.keys(rewardsByPlan)) {
      countdowns[planId] = await getTimeUntilNextClaim(userId, planId);
    }
    
    return {
      allRewards,
      claimable,
      rewardsByPlan,
      countdowns
    };
  } catch (error) {
    console.error("Error getting debug info:", error);
    return { error: error.message };
  }
};
