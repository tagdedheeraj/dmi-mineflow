
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchCompletedTasks, 
  markTaskAsCompleted, 
  saveTaskSubmission, 
  logTaskCompletion,
  updateUserBalance 
} from '@/lib/rewardsService';

export const useTaskCompletion = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  
  // Initialize completed tasks from Firestore
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
  
  // Handle task completion
  const handleCompleteTask = async (taskId: string, data?: any) => {
    if (!user) {
      toast({
        title: "Not Logged In",
        description: "You need to log in to complete tasks and earn rewards.",
        variant: "destructive",
      });
      throw new Error("User not logged in");
    }
    
    // Check if task is already completed
    if (completedTasks.includes(taskId)) {
      toast({
        title: "Task Already Completed",
        description: "You've already completed this task.",
      });
      throw new Error("Task already completed");
    }
    
    let rewardAmount = 0;
    let needsVerification = false;
    
    // Set reward amount based on task type
    switch (taskId) {
      case 'telegram_join':
        rewardAmount = 10;
        break;
      case 'telegram_share':
        rewardAmount = 10;
        break;
      case 'youtube_video':
        rewardAmount = 500;
        needsVerification = true;
        break;
      case 'instagram_post':
        rewardAmount = 100;
        needsVerification = true;
        break;
      case 'twitter_post':
        rewardAmount = 50;
        needsVerification = true;
        break;
      default:
        rewardAmount = 0;
    }
    
    try {
      // Save submission for tasks that need verification
      if (needsVerification) {
        await saveTaskSubmission(user.id, taskId, data, rewardAmount);
        
        // Mark the task as completed
        await markTaskAsCompleted(user.id, taskId, completedTasks);
        
        // Update state
        setCompletedTasks(prev => [...prev, taskId]);
        
        toast({
          title: "Submission Received",
          description: "Your submission is pending verification. Rewards will be credited upon approval.",
        });
        
        return;
      }
      
      // For instant tasks, update user balance immediately
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
      
      // Mark task as completed
      await markTaskAsCompleted(user.id, taskId, completedTasks);
      
      // Update state
      setCompletedTasks(prev => [...prev, taskId]);
      
      // Log task completion
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
