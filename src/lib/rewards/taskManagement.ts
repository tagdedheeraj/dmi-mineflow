import { 
  db, 
} from '../firebase';
import { 
  collection, 
  addDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';

// Add the missing functions needed by useTaskCompletion
export const fetchTaskCompletions = async (userId: string): Promise<any[]> => {
  try {
    // Implementation of the function to fetch completed tasks
    // Query Firestore for completed tasks by this user
    const completionsCollection = collection(db, 'task_completions');
    const q = query(completionsCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching task completions:", error);
    return [];
  }
};

export const registerTaskSubmission = async (userId: string, taskId: string, data: any): Promise<boolean> => {
  try {
    // Implementation of the function to save task submission
    const submissionsCollection = collection(db, 'task_submissions');
    await addDoc(submissionsCollection, {
      userId,
      taskId,
      data,
      timestamp: Date.now(),
      status: 'pending'
    });
    
    return true;
  } catch (error) {
    console.error("Error registering task submission:", error);
    return false;
  }
};

export const markTaskAsCompleted = async (
  userId: string, 
  taskId: string, 
  reward: number,
  completionDate: string = new Date().toISOString()
): Promise<boolean> => {
  try {
    // Implementation of the function to log task completion
    const completionsCollection = collection(db, 'task_completions');
    await addDoc(completionsCollection, {
      userId,
      taskId,
      reward,
      completionDate,
      timestamp: Date.now()
    });
    
    return true;
  } catch (error) {
    console.error("Error marking task as completed:", error);
    return false;
  }
};
