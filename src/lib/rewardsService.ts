// This file now just re-exports all reward services for backward compatibility
// New code should import from the specific modules or from '@/lib/rewards'

// Re-export everything from the rewards modules
export * from './rewards/dateUtils';
export * from './rewards/rewardsTracking';
export * from './rewards/taskManagement';
export * from './rewards/usdtEarnings';
export * from './rewards/referralCommissions';

// Fix the function call with missing argument:
export const markTaskAsCompleted = async (
  userId: string, 
  taskId: string, 
  reward: number
): Promise<boolean> => {
  try {
    // Use the correct number of arguments
    await logTaskCompletion(userId, taskId, reward, new Date().toISOString());
    return true;
  } catch (error) {
    console.error("Error marking task as completed:", error);
    return false;
  }
};
