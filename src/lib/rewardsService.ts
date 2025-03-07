import { 
  db, 
  auth,
  addUsdtTransaction
} from './firebase';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc,
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { User } from './storage';

// Function to get today's date in YYYY-MM-DD format
export const getTodayDateKey = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

// Fetch rewards data for a user
export const fetchRewardsData = async (userId: string) => {
  try {
    const todayKey = getTodayDateKey();
    const rewardsRef = doc(db, 'rewards', `${userId}_${todayKey}`);
    const rewardsDoc = await getDoc(rewardsRef);
    
    if (rewardsDoc.exists()) {
      return rewardsDoc.data();
    } else {
      // Create a new document for today
      const newData = {
        userId,
        date: todayKey,
        adsWatched: 0,
        earnings: 0
      };
      
      await setDoc(rewardsRef, newData);
      return newData;
    }
  } catch (error) {
    console.error("Error fetching rewards data:", error);
    return null;
  }
};

// Fetch completed tasks for a user
export const fetchCompletedTasks = async (userId: string) => {
  try {
    const tasksRef = doc(db, 'user_tasks', userId);
    const tasksDoc = await getDoc(tasksRef);
    
    if (tasksDoc.exists()) {
      return tasksDoc.data().completedTasks || [];
    } else {
      // Create a new document for user tasks
      await setDoc(tasksRef, {
        userId,
        completedTasks: []
      });
      return [];
    }
  } catch (error) {
    console.error("Error fetching completed tasks:", error);
    return [];
  }
};

// Update rewards data in Firestore
export const updateRewardsData = async (userId: string, adsWatched: number, earnings: number) => {
  try {
    const todayKey = getTodayDateKey();
    const rewardsRef = doc(db, 'rewards', `${userId}_${todayKey}`);
    
    await updateDoc(rewardsRef, {
      adsWatched,
      earnings
    });
    
    return true;
  } catch (error) {
    console.error("Error updating rewards data:", error);
    return false;
  }
};

// Mark a task as completed
export const markTaskAsCompleted = async (userId: string, taskId: string, completedTasks: string[]) => {
  try {
    const tasksRef = doc(db, 'user_tasks', userId);
    const tasksDoc = await getDoc(tasksRef);
    
    if (tasksDoc.exists()) {
      await updateDoc(tasksRef, {
        completedTasks: [...completedTasks, taskId]
      });
    } else {
      await setDoc(tasksRef, {
        userId,
        completedTasks: [taskId]
      });
    }
    
    return true;
  } catch (error) {
    console.error(`Error marking task ${taskId} as completed:`, error);
    return false;
  }
};

// Save task submission for verification
export const saveTaskSubmission = async (
  userId: string, 
  taskId: string, 
  data: any, 
  rewardAmount: number
) => {
  try {
    const submissionsRef = collection(db, 'task_submissions');
    await addDoc(submissionsRef, {
      userId,
      taskId,
      data,
      timestamp: Date.now(),
      status: 'pending',
      rewardAmount
    });
    
    return true;
  } catch (error) {
    console.error(`Error saving task submission for ${taskId}:`, error);
    return false;
  }
};

// Log task completion
export const logTaskCompletion = async (userId: string, taskId: string, rewardAmount: number) => {
  try {
    const taskLogsRef = collection(db, 'task_logs');
    await addDoc(taskLogsRef, {
      userId,
      taskId,
      timestamp: Date.now(),
      rewardAmount
    });
    
    return true;
  } catch (error) {
    console.error(`Error logging task completion for ${taskId}:`, error);
    return false;
  }
};

// Function to get the last USDT earnings update date
export const getLastUsdtUpdateDate = async (userId: string): Promise<string | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && userDoc.data().lastUsdtEarningsUpdate) {
      return userDoc.data().lastUsdtEarningsUpdate;
    }
    return null;
  } catch (error) {
    console.error("Error getting last USDT update date:", error);
    return null;
  }
};

// Function to update the last USDT earnings update date
export const updateLastUsdtUpdateDate = async (userId: string, date: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastUsdtEarningsUpdate: date
    });
    console.log(`Updated lastUsdtEarningsUpdate for user ${userId} to ${date}`);
  } catch (error) {
    console.error("Error updating last USDT update date:", error);
  }
};

// Update user balance - Uses increment() instead of setting the value
export const updateUserBalance = async (userId: string, amount: number): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Use the increment() function from Firestore to add the amount to the existing balance
    await updateDoc(userRef, {
      balance: increment(amount)
    });
    
    // Fetch and return the updated user
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() as User : null;
  } catch (error) {
    console.error("Error updating user balance:", error);
    return null;
  }
};

// Get user data
export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as User;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

// Function to update USDT earnings with improved logging and transaction recording
export const updateUsdtEarnings = async (userId: string, amount: number): Promise<User | null> => {
  try {
    console.log(`Updating USDT earnings for user ${userId}: +${amount} USDT`);
    
    const userRef = doc(db, 'users', userId);
    const userBefore = await getDoc(userRef);
    
    if (!userBefore.exists()) {
      console.error(`User ${userId} does not exist, cannot update USDT earnings`);
      return null;
    }
    
    const currentUsdtEarnings = userBefore.data().usdtEarnings || 0;
    console.log(`Current USDT earnings: ${currentUsdtEarnings}, Adding: ${amount}`);
    
    // Use increment to add the amount to existing USDT earnings
    await updateDoc(userRef, {
      usdtEarnings: increment(amount)
    });
    
    // Log the transaction with more specific details
    await addUsdtTransaction(
      userId,
      amount,
      'deposit',
      'Daily plan earnings',
      Date.now()
    );
    
    console.log(`Successfully added ${amount} USDT to user ${userId}'s earnings from plan`);
    
    // Fetch and return the updated user
    const updatedUser = await getUser(userId);
    console.log(`Updated user USDT earnings: ${updatedUser?.usdtEarnings}`);
    
    return updatedUser;
  } catch (error) {
    console.error("Error updating USDT earnings:", error);
    return null;
  }
};

// Enhanced function to process daily USDT earnings with better error handling
export const processDailyUsdtEarnings = async (
  userId: string,
  activePlans: ActivePlan[],
  plansData: MiningPlan[]
): Promise<{
  success: boolean;
  totalAmount: number;
  details: Array<{ planId: string; planName: string; amount: number }>;
  error?: string;
}> => {
  try {
    console.log(`Processing daily USDT earnings for user ${userId}`);
    
    if (!userId || !activePlans || activePlans.length === 0) {
      console.log("No active plans to process");
      return { success: true, totalAmount: 0, details: [] };
    }
    
    // Get the current date in Indian Standard Time
    const now = new Date();
    const indiaTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const todayIST = indiaTime.toISOString().split('T')[0];
    
    console.log(`Current date in IST: ${todayIST}`);
    
    // Check if we already processed today's earnings
    const lastUpdate = await getLastUsdtUpdateDate(userId);
    console.log(`Last update date: ${lastUpdate}`);
    
    if (lastUpdate === todayIST) {
      console.log("Already processed earnings for today (IST)");
      return { success: true, totalAmount: 0, details: [] };
    }
    
    let totalEarnings = 0;
    const earningsDetails: Array<{ planId: string; planName: string; amount: number }> = [];
    
    // Process each active plan
    for (const plan of activePlans) {
      // Check if plan is still active
      if (new Date(plan.expiresAt) <= now) {
        console.log(`Plan ${plan.id} has expired, skipping`);
        continue;
      }
      
      // Find the plan details
      const planInfo = plansData.find(p => p.id === plan.id);
      if (!planInfo) {
        console.log(`Could not find details for plan ${plan.id}, skipping`);
        continue;
      }
      
      // Add daily earnings for this plan
      const amount = planInfo.dailyEarnings;
      totalEarnings += amount;
      earningsDetails.push({
        planId: plan.id,
        planName: planInfo.name,
        amount
      });
      
      console.log(`Added ${amount} USDT from ${planInfo.name} plan`);
    }
    
    if (totalEarnings > 0) {
      // Update user's USDT balance
      const updatedUser = await updateUsdtEarnings(userId, totalEarnings);
      if (!updatedUser) {
        throw new Error("Failed to update user's USDT earnings");
      }
      
      // Record transaction
      await addUsdtTransaction(
        userId,
        totalEarnings,
        'deposit',
        'Daily earnings from mining plans',
        Date.now()
      );
      
      // Update last update date to today in IST
      await updateLastUsdtUpdateDate(userId, todayIST);
      
      console.log(`Successfully processed ${totalEarnings} USDT in daily earnings`);
    } else {
      console.log("No earnings to process");
    }
    
    return {
      success: true,
      totalAmount: totalEarnings,
      details: earningsDetails
    };
  } catch (error) {
    console.error("Error processing daily USDT earnings:", error);
    return {
      success: false,
      totalAmount: 0,
      details: [],
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};
