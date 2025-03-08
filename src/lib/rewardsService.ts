import { updateUserBalance } from './firestore';
import { notifyTaskCompleted } from './rewards/notificationService';
import { markTaskAsCompleted } from './rewards/taskManagement';

// Function to log task completion and award rewards
export const logTaskCompletion = async (userId: string, taskId: string, reward: number, taskName: string) => {
  try {
    // Mark the task as completed in Firestore
    const result = await markTaskAsCompleted(userId, taskId, reward);
    
    if (result) {
      // Update the user's balance
      await updateUserBalance(userId, reward);
      
      // Create a notification
      await notifyTaskCompleted(userId, taskName, reward);
      
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error completing task:", error);
    return false;
  }
};

// Function to award bonus coins for completing a special task
export const awardBonusCoins = async (userId: string, amount: number, reason: string) => {
  try {
    // Update the user's balance
    await updateUserBalance(userId, amount);
    
    // Create a notification
    await notifyTaskCompleted(userId, reason, amount);
    
    return true;
  } catch (error) {
    console.error("Error awarding bonus coins:", error);
    return false;
  }
};

// Function to check if a user has enough coins for a purchase
export const hasEnoughCoins = async (userId: string, requiredAmount: number) => {
  try {
    const user = await import('./firestore').then(module => module.getUser(userId));
    
    if (!user) {
      return false;
    }
    
    return user.balance >= requiredAmount;
  } catch (error) {
    console.error("Error checking if user has enough coins:", error);
    return false;
  }
};

// Function to deduct coins from a user's balance (for purchases)
export const deductCoins = async (userId: string, amount: number, reason: string) => {
  try {
    // Deduct from user's balance (negative amount)
    await updateUserBalance(userId, -amount);
    
    // Log the transaction
    await import('./firestore').then(module => 
      module.addUsdtTransaction(
        userId,
        amount,
        'withdrawal',
        reason,
        Date.now()
      )
    );
    
    return true;
  } catch (error) {
    console.error("Error deducting coins:", error);
    return false;
  }
};

// Other reward-related services can be added here
