
import { 
  db, 
  auth,
  addUsdtTransaction
} from './firebase';
import { 
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
import { updateUserBalance, getUser } from './firestore';

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

// Update user balance - MODIFIED to use increment() instead of setting the value
export const updateUserBalance = async (userId: string, amount: number): Promise<User | null> => {
  try {
    return await updateUserBalance(userId, amount);
  } catch (error) {
    console.error("Error updating user balance:", error);
    return null;
  }
};

// Get user data
export const getUser = async (userId: string): Promise<User | null> => {
  try {
    return await getUser(userId);
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};
