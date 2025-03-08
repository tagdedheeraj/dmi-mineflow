import { 
  updateUserBalance, 
  getUser, 
  fetchRewardsData, 
  updateRewardsData 
} from './rewards';
import { 
  getTasksForUser, 
  markTaskAsComplete 
} from './rewards/taskManagement';
import { 
  awardPlanPurchaseCommission 
} from './rewards/referral'; // Updated to use the referral modules

// Function to handle claiming a reward
export const claimReward = async (userId: string, rewardType: string, amount: number) => {
  try {
    // Update user balance
    const updatedUser = await updateUserBalance(userId, amount);
    if (!updatedUser) {
      throw new Error("Failed to update user balance");
    }

    // Fetch and update rewards data
    const rewardsData = await fetchRewardsData(userId);
    if (rewardsData) {
      await updateRewardsData(userId, rewardsData.adsWatched, rewardsData.earnings + amount);
    }

    console.log(`User ${userId} claimed ${amount} ${rewardType}`);
    return updatedUser;
  } catch (error) {
    console.error("Error claiming reward:", error);
    return null;
  }
};

// Function to handle completing a task
export const completeTask = async (userId: string, taskId: string, rewardAmount: number) => {
  try {
    // Mark task as complete
    const isTaskCompleted = await markTaskAsComplete(userId, taskId);
    if (!isTaskCompleted) {
      throw new Error("Failed to mark task as complete");
    }

    // Update user balance
    const updatedUser = await updateUserBalance(userId, rewardAmount);
    if (!updatedUser) {
      throw new Error("Failed to update user balance");
    }

    console.log(`User ${userId} completed task ${taskId} and earned ${rewardAmount}`);
    return updatedUser;
  } catch (error) {
    console.error("Error completing task:", error);
    return null;
  }
};

// Function to get all tasks for a user
export const getAllTasks = async (userId: string) => {
  try {
    const tasks = await getTasksForUser(userId);
    return tasks;
  } catch (error) {
    console.error("Error getting tasks for user:", error);
    return [];
  }
};
