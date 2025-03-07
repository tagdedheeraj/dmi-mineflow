
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

// Convert to IST (UTC+5:30)
const convertToIST = (date: Date) => {
  // IST is UTC+5:30
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  const istTime = new Date(utcTime + (5.5 * 60 * 60 * 1000));
  return istTime;
};

// Get today's date in YYYY-MM-DD format in IST
export const getTodayDateKey = () => {
  const today = convertToIST(new Date());
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

// Function to get the last USDT earnings update date (in IST)
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

// Function to update the last USDT earnings update date (using IST date)
export const updateLastUsdtUpdateDate = async (userId: string, date: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastUsdtEarningsUpdate: date
    });
    console.log(`Updated lastUsdtEarningsUpdate for user ${userId} to ${date} (IST)`);
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
  activePlans: Array<any>, 
  plansData: Array<any>
): Promise<{
  success: boolean;
  totalAmount: number;
  details: {planName: string; amount: number}[];
}> => {
  try {
    // Get today's date in IST (YYYY-MM-DD)
    const todayIST = getTodayDateKey();
    const lastUpdateDate = await getLastUsdtUpdateDate(userId);
    
    console.log(`Processing daily USDT earnings for user ${userId} (IST time)`);
    console.log(`Today (IST): ${todayIST}, Last update: ${lastUpdateDate}`);
    
    // If already updated today (IST), return without processing
    if (lastUpdateDate === todayIST) {
      console.log(`Already processed earnings for today (${todayIST} IST), skipping.`);
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
      // Skip expired plans
      if (new Date() >= new Date(plan.expiresAt)) {
        console.log(`Plan ${plan.id} has expired, skipping.`);
        continue;
      }
      
      const planInfo = plansData.find((p: any) => p.id === plan.id);
      if (planInfo) {
        console.log(`Processing earnings for plan: ${planInfo.name}, dailyEarnings: ${planInfo.dailyEarnings}`);
        totalDailyEarnings += planInfo.dailyEarnings;
        earningDetails.push({
          planName: planInfo.name,
          amount: planInfo.dailyEarnings
        });
      } else {
        console.log(`Could not find plan info for id: ${plan.id}`);
      }
    }
    
    if (totalDailyEarnings > 0) {
      console.log(`Adding total of ${totalDailyEarnings} USDT to user ${userId}'s earnings (IST time update)`);
      
      // Update user's USDT earnings
      const updatedUser = await updateUsdtEarnings(userId, totalDailyEarnings);
      
      if (updatedUser) {
        // Update the last update date to today's IST date
        await updateLastUsdtUpdateDate(userId, todayIST);
        console.log(`Updated last USDT earnings date to ${todayIST} (IST)`);
        
        return {
          success: true,
          totalAmount: totalDailyEarnings,
          details: earningDetails
        };
      } else {
        throw new Error("Failed to update user's USDT earnings");
      }
    } else {
      // Even if there are no earnings, update the date to avoid checking again today
      console.log(`No earnings to add, updating last update date to ${todayIST} (IST)`);
      await updateLastUsdtUpdateDate(userId, todayIST);
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
