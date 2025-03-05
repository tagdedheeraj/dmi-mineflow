
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockUnityAds, unityAds } from '@/components/rewards/UnityAds';
import {
  updateRewardsData,
  fetchRewardsData
} from '@/lib/rewardsService';
import { useToast } from '@/hooks/use-toast';

export const useAdWatching = () => {
  const { user, updateBalance } = useAuth();
  const { toast } = useToast();
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [isAdComplete, setIsAdComplete] = useState(false);
  const [countdownTime, setCountdownTime] = useState(0);
  const [todayAdsWatched, setTodayAdsWatched] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);
  
  const MAX_DAILY_ADS = 10;
  
  // Load today's rewards data
  useEffect(() => {
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
  
  // Check for countdown from localStorage
  useEffect(() => {
    if (!user) return;
    
    const storedCountdown = localStorage.getItem(`adCountdown_${user.id}`);
    const storedTime = localStorage.getItem(`adCountdownTime_${user.id}`);
    
    if (storedCountdown && storedTime) {
      const endTime = parseInt(storedTime, 10);
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      
      if (remaining > 0) {
        setCountdownTime(Math.ceil(remaining / 1000));
        const intervalId = setInterval(() => {
          setCountdownTime((prev) => {
            if (prev <= 1) {
              clearInterval(intervalId);
              localStorage.removeItem(`adCountdown_${user.id}`);
              localStorage.removeItem(`adCountdownTime_${user.id}`);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        return () => clearInterval(intervalId);
      } else {
        localStorage.removeItem(`adCountdown_${user.id}`);
        localStorage.removeItem(`adCountdownTime_${user.id}`);
      }
    }
  }, [user]);
  
  const handleWatchAd = useCallback(async () => {
    if (!user || todayAdsWatched >= MAX_DAILY_ADS) return;
    
    setIsWatchingAd(true);
    
    // Use the real or mock Unity Ads based on availability
    const adsService = unityAds.isReady() ? unityAds : mockUnityAds;
    
    // Show ad
    adsService.show(async () => {
      // Ad completed successfully
      setIsWatchingAd(false);
      setIsAdComplete(true);
      
      // Update user's balance (ADD 1 DMI coin, not replace)
      // Fix: Use updateBalance to add 1 DMI coin instead of replacing
      const newBalance = user.balance + 1;
      await updateBalance(newBalance);
      
      // Update rewards data
      const newAdsWatched = todayAdsWatched + 1;
      const newEarnings = todayEarnings + 1;
      
      await updateRewardsData(user.id, newAdsWatched, newEarnings);
      
      setTodayAdsWatched(newAdsWatched);
      setTodayEarnings(newEarnings);
      
      // Show success message
      toast({
        title: "Reward Earned!",
        description: "You've earned 1 DMI coin for watching the ad.",
      });
      
      // Set countdown for next ad (5 minutes)
      const COUNTDOWN_TIME = 5 * 60; // 5 minutes in seconds
      setCountdownTime(COUNTDOWN_TIME);
      
      // Store countdown in localStorage
      const endTime = Date.now() + (COUNTDOWN_TIME * 1000);
      localStorage.setItem(`adCountdown_${user.id}`, "true");
      localStorage.setItem(`adCountdownTime_${user.id}`, endTime.toString());
      
      // Start countdown timer
      const intervalId = setInterval(() => {
        setCountdownTime((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId);
            setIsAdComplete(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Clear the completion state after a few seconds
      setTimeout(() => {
        setIsAdComplete(false);
      }, 3000);
    });
  }, [user, todayAdsWatched, todayEarnings, updateBalance, toast]);
  
  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
