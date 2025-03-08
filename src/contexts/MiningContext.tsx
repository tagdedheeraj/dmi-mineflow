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
  checkAndUpdateMining
} from '@/lib/firestore';
import { miningPlans } from '@/data/miningPlans';
import { processDailyUsdtEarnings } from '@/lib/rewards/dailyEarningsProcessor';
import { usePlanManagement } from '@/hooks/usePlanManagement';
import { useMiningCalculations } from '@/hooks/useMiningCalculations';
import { useMiningSession } from '@/hooks/useMiningSession';
import { useDailyEarnings } from '@/hooks/useDailyEarnings';

const MiningContext = createContext<MiningContextType | undefined>(undefined);

export const MiningProvider: React.FC<MiningProviderProps> = ({ children }) => {
  const { user, updateUser } = useAuth();
  const userId = user?.id;
  
  const [activePlans, setActivePlans] = useState<ActivePlan[]>([]);
  const [dailyEarningsUpdateTime, setDailyEarningsUpdateTime] = useState<string>('12:01 AM');
  
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
  
  const miningRate = calculateTotalMiningRate();
  
  const {
    currentMining,
    setCurrentMining,
    isMining,
    setIsMining,
    startMining,
    stopMining
  } = useMiningSession(
    userId, 
    (balance: number) => { 
      if (userId) updateUserBalance(userId, balance); 
    },
    () => miningRate
  );

  const {
    lastUsdtEarningsUpdate,
    dailyEarningsUpdateTime: earningsUpdateTime,
    checkAndProcessDailyEarnings,
    scheduleNextMidnight
  } = useDailyEarnings(userId, activePlans, updateUser);

  useEffect(() => {
    if (earningsUpdateTime) {
      setDailyEarningsUpdateTime(earningsUpdateTime);
    }
  }, [earningsUpdateTime]);

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
    
    const intervalId = setInterval(loadActivePlans, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [userId]);
  
  useEffect(() => {
    if (!currentMining) return;
    
    const { progress, earnings, remainingSec } = updateMiningProgress(currentMining);
    
    setMiningProgress(progress);
    setCurrentEarnings(earnings);
    setTimeRemaining(remainingSec);
    
    const intervalId = setInterval(() => {
      const updated = updateMiningProgress(currentMining);
      setMiningProgress(updated.progress);
      setCurrentEarnings(updated.earnings);
      setTimeRemaining(updated.remainingSec);
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [currentMining, updateMiningProgress]);
  
  useEffect(() => {
    if (!userId || activePlans.length === 0) return;
    
    checkAndProcessDailyEarnings(miningPlans);
    
    const timeoutId = scheduleNextMidnight(() => {
      checkAndProcessDailyEarnings(miningPlans);
    });
    
    return () => clearTimeout(timeoutId);
  }, [userId, activePlans, checkAndProcessDailyEarnings, scheduleNextMidnight]);
  
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
    dailyEarningsUpdateTime
  };
  
  return (
    <MiningContext.Provider value={value}>
      {children}
    </MiningContext.Provider>
  );
};

export const useMining = (): MiningContextType => {
  const context = useContext(MiningContext);
  if (context === undefined) {
    throw new Error('useMining must be used within a MiningProvider');
  }
  return context;
};
