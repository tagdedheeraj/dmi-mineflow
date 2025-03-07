import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { unityAds, mockUnityAds } from '@/components/rewards/UnityAds';
import { 
  fetchRewardsData, 
  updateRewardsData, 
  updateUserBalance,
  getTodayDateKey
} from '@/lib/rewards';

export const useAdWatching = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  // State for ad viewing and rewards
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [isAdComplete, setIsAdComplete] = useState(false);
  const [countdownTime, setCountdownTime] = useState(0);
  const [todayAdsWatched, setTodayAdsWatched] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);
  
  // Maximum daily ad limit
  const MAX_DAILY_ADS = 20;
  
  // Initialize Unity Ads and state on component mount
  useEffect(() => {
    // Initialize Unity Ads
    unityAds.initialize();
    console.log('Unity Ads initialization requested from useAdWatching hook');
    
    // Fetch rewards data from Firestore if user is logged in
    const loadRewardsData = async () => {
      if (!user) return;
      
      try {
        const rewardsData = await fetchRewardsData(user.id);
        if (rewardsData) {
          setTodayAdsWatched(rewardsData.adsWatched || 0);
          setTodayEarnings(rewardsData.earnings || 0);
        }
      } catch (error) {
        console.error("Error loading rewards data:", error);
      }
    };
    
    loadRewardsData();
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
      
      try {
        await updateRewardsData(user.id, todayAdsWatched, todayEarnings);
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
      // Update user's balance (add 1 DMI coin) - using increment method instead of setting to 1
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
  
  return {
    isWatchingAd,
    isAdComplete,
    countdownTime,
    todayAdsWatched,
    todayEarnings,
    MAX_DAILY_ADS,
    handleWatchAd,
    formatCountdown,
  };
};

export default useAdWatching;
