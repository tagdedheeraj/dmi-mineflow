
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchTaskCompletions, 
  registerTaskSubmission, 
  markTaskAsCompleted 
} from '@/lib/rewards/taskManagement';
import { updateUserBalance } from '@/lib/firestore';
import { notifyTaskCompleted } from '@/lib/rewards/notificationService';

export const useTaskCompletion = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);

  // Load completed tasks
  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchTaskCompletions(user.id)
        .then(data => {
          setCompletedTasks(data);
        })
        .catch(error => {
          console.error("Error fetching task completions:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]);

  // Function to check if a task is completed
  const isTaskCompleted = (taskId: string): boolean => {
    return completedTasks.some(task => task.taskId === taskId);
  };

  // Function to submit task data
  const submitTask = async (taskId: string, data: any): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const result = await registerTaskSubmission(user.id, taskId, data);
      return result;
    } catch (error) {
      console.error("Error submitting task:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Function to mark a task as completed and award coins
  const completeTask = async (taskId: string, reward: number, taskName: string): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    try {
      // Mark the task as completed in Firestore
      const result = await markTaskAsCompleted(user.id, taskId, reward);
      
      if (result) {
        // Update the user's balance
        await updateUserBalance(user.id, reward);
        
        // Create a notification
        await notifyTaskCompleted(user.id, taskName, reward);
        
        // Update local state
        setCompletedTasks(prev => [...prev, { 
          userId: user.id,
          taskId,
          completionDate: new Date().toISOString()
        }]);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error completing task:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    completedTasks,
    isTaskCompleted,
    submitTask,
    completeTask
  };
};
