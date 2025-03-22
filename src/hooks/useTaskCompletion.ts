
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchCompletedTasks, 
  markTaskAsCompleted, 
  saveTaskSubmission, 
  logTaskCompletion,
  updateUserBalance,
  getTaskReward 
} from '@/lib/rewards';

export const useTaskCompletion = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  
  useEffect(() => {
    const loadCompletedTasks = async () => {
      if (!user) return;
      
      try {
        const tasks = await fetchCompletedTasks(user.id);
        setCompletedTasks(tasks);
      } catch (error) {
        console.error("Error loading completed tasks:", error);
      }
    };
    
    loadCompletedTasks();
  }, [user]);
  
  const handleCompleteTask = async (taskId: string, data?: any) => {
    if (!user) {
      toast({
        title: "Not Logged In",
        description: "You need to log in to complete tasks and earn rewards.",
        variant: "destructive",
      });
      throw new Error("User not logged in");
    }
    
    if (completedTasks.includes(taskId)) {
      toast({
        title: "Task Already Completed",
        description: "You've already completed this task.",
      });
      throw new Error("Task already completed");
    }
    
    // Get the dynamic reward amount for this task
    const rewardAmount = await getTaskReward(taskId);
    let needsVerification = false;
    
    switch (taskId) {
      case 'telegram_join':
      case 'telegram_share':
        break;
      case 'youtube_video':
      case 'instagram_post':
      case 'twitter_post':
        needsVerification = true;
        break;
      default:
        // For any other tasks
        break;
    }
    
    try {
      if (needsVerification) {
        await saveTaskSubmission(user.id, taskId, data, rewardAmount);
        
        await markTaskAsCompleted(user.id, taskId, completedTasks);
        
        setCompletedTasks(prev => [...prev, taskId]);
        
        toast({
          title: "Submission Received",
          description: "Your submission is pending verification. Rewards will be credited upon approval.",
        });
        
        return;
      }
      
      if (rewardAmount > 0) {
        const updatedUser = await updateUserBalance(user.id, rewardAmount);
        if (updatedUser) {
          updateUser(updatedUser);
        }
        
        toast({
          title: "Task Completed!",
          description: `You've earned ${rewardAmount} DMI coins!`,
        });
      }
      
      await markTaskAsCompleted(user.id, taskId, completedTasks);
      
      setCompletedTasks(prev => [...prev, taskId]);
      
      await logTaskCompletion(user.id, taskId, rewardAmount);
      
    } catch (error) {
      console.error(`Error completing task ${taskId}:`, error);
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  return {
    completedTasks,
    handleCompleteTask
  };
};

export default useTaskCompletion;
