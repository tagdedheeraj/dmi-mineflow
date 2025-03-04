
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserBalance, getUser, updateDoc, doc, getDoc, setDoc, collection, addDoc, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { unityAds, mockUnityAds } from '@/components/rewards/UnityAds';

export const useRewards = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  // State for ad viewing and rewards
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [isAdComplete, setIsAdComplete] = useState(false);
  const [countdownTime, setCountdownTime] = useState(0);
  const [todayAdsWatched, setTodayAdsWatched] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [activeTab, setActiveTab] = useState("videos");
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  
  // Maximum daily ad limit
  const MAX_DAILY_ADS = 20;
  
  // Get today's date in YYYY-MM-DD format for tracking ads watched
  const getTodayDateKey = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };
  
  // Initialize Unity Ads and state on component mount
  useEffect(() => {
    // Initialize Unity Ads
    unityAds.initialize();
    console.log('Unity Ads initialization requested from useRewards hook');
    
    // Fetch rewards data from Firestore if user is logged in
    const fetchRewardsData = async () => {
      if (!user) return;
      
      try {
        // Fetch rewards data
        const todayKey = getTodayDateKey();
        const rewardsRef = doc(db, 'rewards', `${user.id}_${todayKey}`);
        const rewardsDoc = await getDoc(rewardsRef);
        
        if (rewardsDoc.exists()) {
          const data = rewardsDoc.data();
          setTodayAdsWatched(data.adsWatched || 0);
          setTodayEarnings(data.earnings || 0);
        } else {
          // Create a new document for today
          await setDoc(rewardsRef, {
            userId: user.id,
            date: todayKey,
            adsWatched: 0,
            earnings: 0
          });
        }
        
        // Fetch completed tasks
        const tasksRef = doc(db, 'user_tasks', user.id);
        const tasksDoc = await getDoc(tasksRef);
        
        if (tasksDoc.exists()) {
          setCompletedTasks(tasksDoc.data().completedTasks || []);
        } else {
          // Create a new document for user tasks
          await setDoc(tasksRef, {
            userId: user.id,
            completedTasks: []
          });
        }
      } catch (error) {
        console.error("Error fetching rewards data:", error);
      }
    };
    
    fetchRewardsData();
  }, [user]);
  
  // Handle countdown logic
  useEffect(() => {
    let timer: number | undefined;
    
    if (countdownTime > 0) {
      timer = window.setInterval(() => {
        setCountdownTime(prevTime => prevTime - 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdownTime]);
  
  // Update Firestore when values change
  useEffect(() => {
    const updateFirestore = async () => {
      if (!user) return;
      
      const todayKey = getTodayDateKey();
      const rewardsRef = doc(db, 'rewards', `${user.id}_${todayKey}`);
      
      try {
        await updateDoc(rewardsRef, {
          adsWatched: todayAdsWatched,
          earnings: todayEarnings
        });
      } catch (error) {
        console.error("Error updating rewards data:", error);
      }
    };
    
    // Only update Firestore if values have changed and user exists
    if (user && (todayAdsWatched > 0 || todayEarnings > 0)) {
      updateFirestore();
    }
  }, [user, todayAdsWatched, todayEarnings]);
  
  // Format countdown time as MM:SS
  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };
  
  // Handle watching an ad
  const handleWatchAd = () => {
    if (!user) {
      toast({
        title: "Not Logged In",
        description: "You need to log in to watch ads and earn rewards.",
        variant: "destructive",
      });
      return;
    }
    
    if (todayAdsWatched >= MAX_DAILY_ADS) {
      toast({
        title: "Daily Limit Reached",
        description: "You've reached your daily limit of 20 ads. Come back tomorrow!",
        variant: "destructive",
      });
      return;
    }
    
    if (countdownTime > 0) {
      toast({
        title: "Please Wait",
        description: `Next ad will be available in ${formatCountdown(countdownTime)}`,
      });
      return;
    }
    
    // Start watching ad
    setIsWatchingAd(true);
    console.log('Attempting to show Unity Ad...');
    
    // Try to use Unity Ads, fall back to mock if needed
    try {
      if (unityAds.isReady()) {
        console.log('Unity Ads is ready, showing ad...');
        unityAds.show(onAdComplete);
      } else {
        console.warn('Unity Ad not ready, falling back to mock implementation');
        mockUnityAds.show(onAdComplete);
      }
    } catch (error) {
      console.error('Error showing Unity Ad:', error);
      mockUnityAds.show(onAdComplete);
    }
  };
  
  // Handle ad completion
  const onAdComplete = async () => {
    if (!user) return;
    
    // Ad completed
    setIsWatchingAd(false);
    setIsAdComplete(true);
    
    try {
      // Update user's balance (add 1 DMI coin)
      const updatedUser = await updateUserBalance(user.id, 1);
      if (updatedUser) {
        updateUser(updatedUser);
      }
      
      // Update today's stats
      setTodayAdsWatched(prev => prev + 1);
      setTodayEarnings(prev => prev + 1);
      
      // Start countdown for next ad (1 minute = 60 seconds)
      setCountdownTime(60);
      
      // Show success toast
      toast({
        title: "Reward Earned!",
        description: "You've earned 1 DMI coin for watching the ad.",
      });
    } catch (error) {
      console.error("Error updating balance after ad:", error);
      toast({
        title: "Error",
        description: "Failed to update your balance. Please try again.",
        variant: "destructive",
      });
    }
    
    // Reset ad complete state after a short delay
    setTimeout(() => {
      setIsAdComplete(false);
    }, 3000);
  };
  
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
        const submissionsRef = collection(db, 'task_submissions');
        await addDoc(submissionsRef, {
          userId: user.id,
          taskId,
          data,
          timestamp: Date.now(),
          status: 'pending',
          rewardAmount
        });
        
        // For tasks that need verification, don't update user balance yet
        // Just mark the task as completed so they can't submit again
        const tasksRef = doc(db, 'user_tasks', user.id);
        const tasksDoc = await getDoc(tasksRef);
        
        if (tasksDoc.exists()) {
          await updateDoc(tasksRef, {
            completedTasks: [...completedTasks, taskId]
          });
        } else {
          await setDoc(tasksRef, {
            userId: user.id,
            completedTasks: [taskId]
          });
        }
        
        // Update state
        setCompletedTasks(prev => [...prev, taskId]);
        return;
      }
      
      // For instant tasks, update user balance immediately
      if (rewardAmount > 0) {
        const updatedUser = await updateUserBalance(user.id, rewardAmount);
        if (updatedUser) {
          updateUser(updatedUser);
        }
      }
      
      // Mark task as completed
      const tasksRef = doc(db, 'user_tasks', user.id);
      const tasksDoc = await getDoc(tasksRef);
      
      if (tasksDoc.exists()) {
        await updateDoc(tasksRef, {
          completedTasks: [...completedTasks, taskId]
        });
      } else {
        await setDoc(tasksRef, {
          userId: user.id,
          completedTasks: [taskId]
        });
      }
      
      // Update state
      setCompletedTasks(prev => [...prev, taskId]);
      
      // Log task completion
      const taskLogsRef = collection(db, 'task_logs');
      await addDoc(taskLogsRef, {
        userId: user.id,
        taskId,
        timestamp: Date.now(),
        rewardAmount
      });
      
    } catch (error) {
      console.error(`Error completing task ${taskId}:`, error);
      throw error;
    }
  };
  
  return {
    isWatchingAd,
    isAdComplete,
    countdownTime,
    todayAdsWatched,
    todayEarnings,
    activeTab,
    setActiveTab,
    MAX_DAILY_ADS,
    handleWatchAd,
    formatCountdown,
    completedTasks,
    handleCompleteTask
  };
};

export default useRewards;
