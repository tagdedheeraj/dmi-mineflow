
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserBalance } from '@/lib/supabaseStorage';
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
    
    const todayKey = getTodayDateKey();
    const storedWatchedAds = localStorage.getItem(`dmi_ads_watched_${todayKey}`);
    const storedEarnings = localStorage.getItem(`dmi_ads_earnings_${todayKey}`);
    
    if (storedWatchedAds) {
      setTodayAdsWatched(parseInt(storedWatchedAds, 10));
    }
    
    if (storedEarnings) {
      setTodayEarnings(parseInt(storedEarnings, 10));
    }
  }, []);
  
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
  
  // Update local storage when values change
  useEffect(() => {
    const todayKey = getTodayDateKey();
    localStorage.setItem(`dmi_ads_watched_${todayKey}`, todayAdsWatched.toString());
    localStorage.setItem(`dmi_ads_earnings_${todayKey}`, todayEarnings.toString());
  }, [todayAdsWatched, todayEarnings]);
  
  // Format countdown time as MM:SS
  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };
  
  // Handle watching an ad
  const handleWatchAd = () => {
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
    
    // Try to use Unity Ads, fall back to mock if needed
    try {
      if (unityAds.isReady()) {
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
    // Ad completed
    setIsWatchingAd(false);
    setIsAdComplete(true);
    
    // Update user's balance (add 1 DMI coin)
    if (user) {
      const updatedUser = await updateUserBalance(1);
      if (updatedUser) {
        updateUser(updatedUser);
      }
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
    activeTab,
    setActiveTab,
    MAX_DAILY_ADS,
    handleWatchAd,
    formatCountdown
  };
};

export default useRewards;
