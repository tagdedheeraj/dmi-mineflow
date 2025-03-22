
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

// Default reward amounts in case the Firestore data is unavailable
const DEFAULT_REWARD_AMOUNTS = {
  'telegram_join': 10,
  'telegram_share': 10,
  'youtube_video': 500,
  'instagram_post': 100,
  'twitter_post': 50
};

// Cache for loaded rewards
let cachedRewards: Record<string, number> | null = null;

// Fetch reward amounts for tasks
export const getTaskRewardAmounts = async (): Promise<Record<string, number>> => {
  // Return cached rewards if available
  if (cachedRewards) {
    return cachedRewards;
  }
  
  try {
    // Try to get rewards from Firestore
    const taskRewardsDoc = await getDoc(doc(db, 'app_settings', 'task_rewards'));
    
    if (taskRewardsDoc.exists()) {
      const data = taskRewardsDoc.data();
      
      if (data.tasks && Array.isArray(data.tasks)) {
        // Convert the tasks array to a record of taskId -> rewardAmount
        const rewards = data.tasks.reduce((acc, task) => {
          acc[task.id] = task.rewardAmount;
          return acc;
        }, {} as Record<string, number>);
        
        cachedRewards = rewards;
        return rewards;
      }
    }
    
    // If we couldn't get valid data from Firestore, use defaults
    console.log("Using default task reward amounts");
    return DEFAULT_REWARD_AMOUNTS;
  } catch (error) {
    console.error("Error loading task rewards:", error);
    return DEFAULT_REWARD_AMOUNTS;
  }
};

// Get the reward amount for a specific task
export const getTaskReward = async (taskId: string): Promise<number> => {
  const rewards = await getTaskRewardAmounts();
  return rewards[taskId] || 0;
};

// Clear the cache to force reload from Firestore
export const clearTaskRewardsCache = () => {
  cachedRewards = null;
  console.log("Task rewards cache cleared");
};
