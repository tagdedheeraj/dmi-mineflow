
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface TaskReward {
  id: string;
  name: string;
  description: string;
  rewardAmount: number;
}

const DEFAULT_TASK_REWARDS: TaskReward[] = [
  {
    id: 'telegram_join',
    name: 'Join Telegram Channel',
    description: 'Join our official Telegram channel',
    rewardAmount: 10
  },
  {
    id: 'telegram_share',
    name: 'Share on Telegram',
    description: 'Share our pinned post on Telegram',
    rewardAmount: 10
  },
  {
    id: 'youtube_video',
    name: 'Create YouTube Video',
    description: 'Create and post a video about DMI Network',
    rewardAmount: 500
  },
  {
    id: 'instagram_post',
    name: 'Share on Instagram',
    description: 'Post about DMI Network on Instagram',
    rewardAmount: 100
  },
  {
    id: 'twitter_post',
    name: 'Share on Twitter',
    description: 'Tweet about DMI Network',
    rewardAmount: 50
  }
];

const TaskRewardsManagement: React.FC = () => {
  const [taskRewards, setTaskRewards] = useState<TaskReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load task rewards from Firestore
  useEffect(() => {
    const loadTaskRewards = async () => {
      setIsLoading(true);
      try {
        const taskRewardsDoc = await getDoc(doc(db, 'app_settings', 'task_rewards'));
        
        if (taskRewardsDoc.exists()) {
          const data = taskRewardsDoc.data();
          setTaskRewards(data.tasks || DEFAULT_TASK_REWARDS);
        } else {
          // If document doesn't exist, initialize with default values
          setTaskRewards(DEFAULT_TASK_REWARDS);
        }
      } catch (error) {
        console.error('Error loading task rewards:', error);
        toast({
          title: "Error",
          description: "Failed to load task rewards. Using default values.",
          variant: "destructive",
        });
        setTaskRewards(DEFAULT_TASK_REWARDS);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTaskRewards();
  }, [toast]);

  // Handle reward amount change
  const handleRewardChange = (taskId: string, amount: number) => {
    setTaskRewards(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, rewardAmount: amount } 
          : task
      )
    );
  };

  // Save task rewards to Firestore
  const saveTaskRewards = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'app_settings', 'task_rewards'), {
        tasks: taskRewards,
        updatedAt: new Date().toISOString()
      });
      
      toast({
        title: "Success",
        description: "Task rewards updated successfully",
      });
    } catch (error) {
      console.error('Error saving task rewards:', error);
      toast({
        title: "Error",
        description: "Failed to save task rewards",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-dmi" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-6">Daily Task Rewards Management</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-12 gap-4 p-2 font-medium text-gray-700 bg-gray-50 rounded-md">
          <div className="col-span-4">Task</div>
          <div className="col-span-5">Description</div>
          <div className="col-span-3">Reward (DMI Coins)</div>
        </div>
        
        {taskRewards.map((task) => (
          <div key={task.id} className="grid grid-cols-12 gap-4 p-2 border-b border-gray-100">
            <div className="col-span-4 flex items-center">{task.name}</div>
            <div className="col-span-5 flex items-center text-sm text-gray-600">{task.description}</div>
            <div className="col-span-3">
              <Input
                type="number"
                min="0"
                value={task.rewardAmount}
                onChange={(e) => handleRewardChange(task.id, parseFloat(e.target.value) || 0)}
                className="w-full"
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex justify-end">
        <Button 
          onClick={saveTaskRewards}
          disabled={isSaving}
          className="flex items-center"
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default TaskRewardsManagement;
