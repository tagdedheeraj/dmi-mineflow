
// If there are missing exports for getTasksForUser and markTaskAsComplete, let's add them

import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from '../storage';

export interface Task {
  id: string;
  type: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  completedAt?: number;
}

export const getTasksForUser = async (userId: string): Promise<Task[]> => {
  try {
    const tasksRef = collection(db, 'users', userId, 'tasks');
    const tasksSnapshot = await getDocs(tasksRef);
    
    const tasks: Task[] = [];
    tasksSnapshot.forEach(doc => {
      tasks.push({ id: doc.id, ...doc.data() } as Task);
    });
    
    return tasks;
  } catch (error) {
    console.error("Error getting tasks for user:", error);
    return [];
  }
};

export const markTaskAsComplete = async (userId: string, taskId: string, reward: number): Promise<boolean> => {
  // Alias for markTaskAsCompleted for compatibility
  return markTaskAsCompleted(userId, taskId, reward);
};

export const markTaskAsCompleted = async (userId: string, taskId: string, reward: number): Promise<boolean> => {
  try {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    const now = Date.now();
    
    await updateDoc(taskRef, {
      completed: true,
      completedAt: now
    });
    
    // Update user's balance
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data() as User;
      
      await updateDoc(userRef, {
        balance: (userData.balance || 0) + reward
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error marking task as completed:", error);
    return false;
  }
};
