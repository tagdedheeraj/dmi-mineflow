
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { MiningContextType, MiningProviderProps } from '@/types/mining';
import { MiningSession, ActivePlan } from '@/lib/storage';
import { getTimeUntilMidnightIST } from '@/lib/mining/dateUtils';
import { 
  getCurrentMining, 
  updateUserBalance, 
  getActivePlans,
  saveCurrentMining,
  clearCurrentMining,
  addToMiningHistory,
  checkAndUpdateMining,
  getUser
} from '@/lib/firestore';
import { miningPlans } from '@/data/miningPlans';
import { processDailyUsdtEarnings } from '@/lib/rewards/dailyEarningsProcessor';
import { usePlanManagement } from '@/hooks/usePlanManagement';
import { useMiningCalculations } from '@/hooks/useMiningCalculations';
import { useMiningSession } from '@/hooks/useMiningSession';
import { useDailyEarnings } from '@/hooks/useDailyEarnings';

// Create the context
const MiningContext = createContext<MiningContextType | undefined>(undefined);

// Provider component
export const MiningProvider: React.FC<MiningProviderProps> = ({ children }) => {
  const { user, updateUser } = useAuth();
  const userId = user?.id;
  
  // Initialize state
  const [activePlans, setActivePlans] = useState<ActivePlan[]>([]);
  const [dailyEarningsUpdateTime, setDailyEarningsUpdateTime] = useState<string>('12:01 AM');
  
  // Use custom hooks for mining functionality
  const { updateMiningBoost } = usePlanManagement(userId);
  
  const {
    miningProgress,
    setMiningProgress,
    currentEarnings,
    setCurrentEarnings,
    timeRemaining,
    setTimeRemaining,
    calculateTotalMiningRate,
    updateMiningProgress
  } = useMiningCalculations({ 
    activePlans,
    baseMiningRate: 1
  });
  
  // Calculate mining rate
  const miningRate = calculateTotalMiningRate();
  
  const {
    currentMining,
    setCurrentMining,
    isMining,
    setIsMining,
    startMining,
    stopMining,
    forceRefreshMining
  } = useMiningSession(
    userId, 
    (balance: number) => { 
      if (userId) updateUserBalance(userId, balance); 
    },
    () => miningRate
  );

  // Process daily USDT earnings
  const {
    lastUsdtEarningsUpdate,
    dailyEarningsUpdateTime: earningsUpdateTime,
    checkAndProcessDailyEarnings,
    scheduleNextMidnight
  } = useDailyEarnings(userId, activePlans, updateUser);

  // Update dailyEarningsUpdateTime from the hook
  useEffect(() => {
    if (earningsUpdateTime) {
      setDailyEarningsUpdateTime(earningsUpdateTime);
    }
  }, [earningsUpdateTime]);

  // Load active plans on mount and when user changes
  useEffect(() => {
    const loadActivePlans = async () => {
      if (!userId) {
        setActivePlans([]);
        return;
      }
      
      try {
        const plans = await getActivePlans(userId);
        setActivePlans(plans);
      } catch (error) {
        console.error("Error loading active plans:", error);
      }
    };
    
    loadActivePlans();
    
    // Set up interval to refresh active plans (every hour)
    const intervalId = setInterval(loadActivePlans, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [userId]);
  
  // Update mining progress
  useEffect(() => {
    if (!currentMining) return;
    
    const { progress, earnings, remainingSec } = updateMiningProgress(currentMining);
    
    // Set mining progress state
    setMiningProgress(progress);
    setCurrentEarnings(earnings);
    setTimeRemaining(remainingSec);
    
    // Set up interval to update mining progress
    const intervalId = setInterval(() => {
      const updated = updateMiningProgress(currentMining);
      setMiningProgress(updated.progress);
      setCurrentEarnings(updated.earnings);
      setTimeRemaining(updated.remainingSec);
      
      // Auto-refresh mining when remaining time is zero
      if (updated.remainingSec === 0 && userId) {
        forceRefreshMining();
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [currentMining, updateMiningProgress, userId, forceRefreshMining]);
  
  // Check for daily USDT earnings
  useEffect(() => {
    if (!userId || activePlans.length === 0) return;
    
    // Process daily earnings when component mounts
    checkAndProcessDailyEarnings(miningPlans);
    
    // Schedule next check at midnight IST
    const timeoutId = scheduleNextMidnight(() => {
      checkAndProcessDailyEarnings(miningPlans);
    });
    
    return () => clearTimeout(timeoutId);
  }, [userId, activePlans, checkAndProcessDailyEarnings, scheduleNextMidnight]);
  
  // Context value
  const value: MiningContextType = {
    currentMining,
    miningProgress,
    currentEarnings,
    timeRemaining,
    miningRate,
    startMining,
    stopMining,
    isMining,
    activePlans,
    updateMiningBoost,
    dailyEarningsUpdateTime,
    forceRefreshMining
  };
  
  return (
    <MiningContext.Provider value={value}>
      {children}
    </MiningContext.Provider>
  );
};

// Custom hook to use the mining context
export const useMining = (): MiningContextType => {
  const context = useContext(MiningContext);
  if (context === undefined) {
    throw new Error('useMining must be used within a MiningProvider');
  }
  return context;
};
