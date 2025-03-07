
import { 
  db
} from '../firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc
} from 'firebase/firestore';

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
