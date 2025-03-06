
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
  } catch (error) {
    console.error("Error updating last USDT update date:", error);
  }
};

// Update user balance - MODIFIED to use increment() instead of setting the value
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

// Function to update USDT earnings
export const updateUsdtEarnings = async (userId: string, amount: number): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Use increment to add the amount to existing USDT earnings
    await updateDoc(userRef, {
      usdtEarnings: increment(amount)
    });
    
    // Log the transaction
    await addUsdtTransaction(
      userId,
      amount,
      'deposit',
      'Daily plan earnings',
      Date.now()
    );
    
    console.log(`Added ${amount} USDT to user ${userId}'s earnings from plan`);
    
    // Fetch and return the updated user
    return await getUser(userId);
  } catch (error) {
    console.error("Error updating USDT earnings:", error);
    return null;
  }
};

// Function to process daily USDT earnings for all active plans
export const processDailyUsdtEarnings = async (
  userId: string, 
  activePlans: any[], 
  plansData: any[]
): Promise<{
  success: boolean;
  totalAmount: number;
  details: {planName: string; amount: number}[];
}> => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const lastUpdateDate = await getLastUsdtUpdateDate(userId);
    
    // If already updated today, return without processing
    if (lastUpdateDate === today) {
      return {
        success: true,
        totalAmount: 0,
        details: []
      };
    }
    
    let totalDailyEarnings = 0;
    const earningDetails: {planName: string; amount: number}[] = [];
    
    // Process active plans that haven't expired
    for (const plan of activePlans) {
      if (new Date() >= new Date(plan.expiresAt)) continue;
      
      const planInfo = plansData.find((p: any) => p.id === plan.id);
      if (planInfo) {
        totalDailyEarnings += planInfo.dailyEarnings;
        earningDetails.push({
          planName: planInfo.name,
          amount: planInfo.dailyEarnings
        });
      }
    }
    
    if (totalDailyEarnings > 0) {
      // Update user's USDT earnings
      const updatedUser = await updateUsdtEarnings(userId, totalDailyEarnings);
      if (updatedUser) {
        // Update the last update date
        await updateLastUsdtUpdateDate(userId, today);
        
        return {
          success: true,
          totalAmount: totalDailyEarnings,
          details: earningDetails
        };
      }
    } else {
      // Even if there are no earnings, update the date to avoid checking again today
      await updateLastUsdtUpdateDate(userId, today);
    }
    
    return {
      success: totalDailyEarnings > 0,
      totalAmount: totalDailyEarnings,
      details: earningDetails
    };
  } catch (error) {
    console.error("Error processing daily USDT earnings:", error);
    return {
      success: false,
      totalAmount: 0,
      details: []
    };
  }
};
