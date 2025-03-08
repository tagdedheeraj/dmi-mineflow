import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserBalance } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchTaskCompletions, 
  markTaskAsCompleted,
  registerTaskSubmission
} from '@/lib/rewards/taskManagement';

interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: 'social_follow' | 'task_submission';
  platform?: string;
  link?: string;
}

const fetchCompletedTasks = async (userId: string): Promise<any[]> => {
  // Implement this function to fetch completed tasks from Firestore
  return fetchTaskCompletions(userId);
};

const saveTaskSubmission = async (userId: string, taskId: string, data: any): Promise<boolean> => {
  // Implement this function to save task submission to Firestore
  return registerTaskSubmission(userId, taskId, data);
};

const logTaskCompletion = async (userId: string, taskId: string, reward: number): Promise<boolean> => {
  // Implement this function to log task completion in Firestore
  return markTaskAsCompleted(userId, taskId, reward);
};

export const useTaskCompletion = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompletedTasks = async () => {
      if (user) {
        const tasks = await fetchCompletedTasks(user.id);
        setCompletedTasks(tasks);
        setLoading(false);
      }
    };

    loadCompletedTasks();
  }, [user]);

  const isTaskCompleted = (taskId: string): boolean => {
    return completedTasks.some(task => task.taskId === taskId);
  };

  const handleSocialFollow = async (platform: string) => {
    if (!user) return;

    const task: Task | undefined = socialTasks.find(task => task.platform === platform);

    if (!task) {
      toast({
        title: "Task not found",
        description: "The requested task could not be found.",
        variant: "destructive",
      });
      return;
    }

    if (isTaskCompleted(task.id)) {
      toast({
        title: "Task already completed",
        description: "You have already completed this task.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simulate social follow action
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mark task as completed
      const success = await logTaskCompletion(user.id, task.id, task.reward);

      if (success) {
        setCompletedTasks(prevTasks => [...prevTasks, { taskId: task.id }]);
        await updateUserBalance(user.id, task.reward as number);

        toast({
          title: "Task completed",
          description: `You have successfully followed on ${platform} and earned ${task.reward} DMI coins!`,
        });
      } else {
        toast({
          title: "Task completion failed",
          description: "There was an error marking the task as completed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error completing social follow task:", error);
      toast({
        title: "An error occurred",
        description: "There was an error completing the task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTaskSubmit = async (taskId: string, data: any) => {
    if (!user) return;

    const task: Task | undefined = submissionTasks.find(task => task.id === taskId);

    if (!task) {
      toast({
        title: "Task not found",
        description: "The requested task could not be found.",
        variant: "destructive",
      });
      return;
    }

    if (isTaskCompleted(task.id)) {
      toast({
        title: "Task already completed",
        description: "You have already completed this task.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save task submission
      const submissionSuccess = await saveTaskSubmission(user.id, taskId, data);

      if (submissionSuccess) {
        // Simulate task submission processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mark task as completed
        const completionSuccess = await logTaskCompletion(user.id, task.id, task.reward);

        if (completionSuccess) {
          setCompletedTasks(prevTasks => [...prevTasks, { taskId: task.id }]);
          await updateUserBalance(user.id, task.reward as number);

          toast({
            title: "Task completed",
            description: `You have successfully submitted the task and earned ${task.reward} DMI coins!`,
          });
        } else {
          toast({
            title: "Task completion failed",
            description: "There was an error marking the task as completed. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Task submission failed",
          description: "There was an error submitting the task. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error completing task submission:", error);
      toast({
        title: "An error occurred",
        description: "There was an error completing the task. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    completedTasks,
    loading,
    isTaskCompleted,
    handleSocialFollow,
    handleTaskSubmit,
  };
};

const socialTasks: Task[] = [
  {
    id: 'twitter-follow',
    type: 'social_follow',
    title: 'Follow us on Twitter',
    description: 'Follow our Twitter page to get latest updates.',
    reward: 100,
    platform: 'Twitter',
    link: 'https://twitter.com/dminetwork'
  },
  {
    id: 'youtube-subscribe',
    type: 'social_follow',
    title: 'Subscribe to our YouTube channel',
    description: 'Subscribe to our YouTube channel to get latest updates.',
    reward: 100,
    platform: 'YouTube',
    link: 'https://youtube.com/dminetwork'
  },
  {
    id: 'telegram-join',
    type: 'social_follow',
    title: 'Join our Telegram channel',
    description: 'Join our Telegram channel to get latest updates.',
    reward: 100,
    platform: 'Telegram',
    link: 'https://telegram.com/dminetwork'
  }
];

const submissionTasks: Task[] = [
  {
    id: 'kyc-submission',
    type: 'task_submission',
    title: 'Submit your KYC',
    description: 'Submit your KYC to get verified.',
    reward: 500,
  },
  {
    id: 'feedback-submission',
    type: 'task_submission',
    title: 'Submit your feedback',
    description: 'Submit your feedback to help us improve.',
    reward: 200,
  }
];
