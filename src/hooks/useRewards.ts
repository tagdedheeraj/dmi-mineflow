
import { useState } from 'react';
import useAdWatching from './useAdWatching';
import useTaskCompletion from './useTaskCompletion';

export const useRewards = () => {
  const [activeTab, setActiveTab] = useState("videos");
  
  const {
    isWatchingAd,
    isAdComplete,
    countdownTime,
    todayAdsWatched,
    todayEarnings,
    MAX_DAILY_ADS,
    handleWatchAd,
    formatCountdown,
  } = useAdWatching();
  
  const {
    completedTasks,
    handleCompleteTask
  } = useTaskCompletion();
  
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
