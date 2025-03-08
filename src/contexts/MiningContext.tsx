
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { MiningSession, ActivePlan } from '@/lib/storage';
import { 
  getCurrentMining,
  checkAndUpdateMining,
  getActivePlans
} from '@/lib/firestore';
import { miningPlans as plansData } from '@/data/miningPlans';
import { MiningContextType, MiningProviderProps } from '@/types/mining';
import { useMiningCalculations } from '@/hooks/useMiningCalculations';
import { useDailyEarnings } from '@/hooks/useDailyEarnings';
import { useMiningSession } from '@/hooks/useMiningSession';
import { usePlanManagement } from '@/hooks/usePlanManagement';

const MiningContext = createContext<MiningContextType>({
  currentMining: null,
  miningProgress: 0,
  currentEarnings: 0,
  timeRemaining: 0,
  miningRate: 1, // Default rate: 1 DMI/hour
  startMining: () => {},
  stopMining: () => {},
  isMining: false,
  activePlans: [],
  updateMiningBoost: async () => null,
  dailyEarningsUpdateTime: "12:01 AM",
});

export const useMining = () => useContext(MiningContext);

export const MiningProvider: React.FC<MiningProviderProps> = ({ children }) => {
  const { user, updateBalance, updateUser } = useAuth();
  const [activePlans, setActivePlans] = useState<ActivePlan[]>([]);
  const baseMiningRate = 1;
  
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
    baseMiningRate
  });
  
  const miningRate = calculateTotalMiningRate();
  
  const {
    lastUsdtEarningsUpdate,
    dailyEarningsUpdateTime,
    checkAndProcessDailyEarnings,
    scheduleNextMidnight
  } = useDailyEarnings(
    user?.id,
    activePlans,
    updateUser
  );
  
  const {
    currentMining,
    setCurrentMining,
    isMining,
    setIsMining,
    startMining,
    stopMining
  } = useMiningSession(
    user?.id,
    updateBalance,
    calculateTotalMiningRate
  );
  
  const { updateMiningBoost } = usePlanManagement(user?.id);

  // Load active plans
  useEffect(() => {
    const loadActivePlans = async () => {
      if (!user) return;
      
      try {
        const plans = await getActivePlans(user.id);
        setActivePlans(plans);
      } catch (error) {
        console.error("Error loading active plans:", error);
      }
    };
    
    loadActivePlans();
  }, [user]);

  // Check and update mining session
  useEffect(() => {
    const checkMiningSession = async () => {
      if (!user) return;
      
      try {
        const { updatedSession, earnedCoins } = await checkAndUpdateMining(user.id);
        
        if (earnedCoins > 0) {
          setCurrentMining(null);
          setIsMining(false);
          setMiningProgress(0);
          setCurrentEarnings(0);
          setTimeRemaining(0);
        } 
        else if (updatedSession && updatedSession.status === 'active') {
          setCurrentMining(updatedSession);
          setIsMining(true);
        }
      } catch (error) {
        console.error("Error checking mining session:", error);
      }
    };
    
    checkMiningSession();
  }, [user]);

  // Process daily earnings
  useEffect(() => {
    if (!user || activePlans.length === 0) return;
    
    const processEarnings = () => checkAndProcessDailyEarnings(plansData);
    
    processEarnings();
    
    const hourlyCheckInterval = setInterval(processEarnings, 60 * 60 * 1000);
    
    const scheduleNext = () => {
      return scheduleNextMidnight(processEarnings);
    };
    
    let midnightTimerId = scheduleNext();
    
    return () => {
      clearInterval(hourlyCheckInterval);
      clearTimeout(midnightTimerId);
    };
  }, [user, activePlans, lastUsdtEarningsUpdate, checkAndProcessDailyEarnings, scheduleNextMidnight]);

  // Update mining progress
  useEffect(() => {
    if (!currentMining || currentMining.status !== 'active') {
      return;
    }

    const updateProgress = () => {
      const now = Date.now();
      const { startTime, endTime, rate } = currentMining;
      
      if (now >= endTime) {
        const finalEarnings = Math.floor((endTime - startTime) / (1000 * 60 * 60) * rate);
        
        const completedSession: MiningSession = {
          ...currentMining,
          status: 'completed',
          earned: finalEarnings
        };
        
        clearCurrentMining(currentMining.id!);
        addToMiningHistory(user.id, completedSession);
        
        if (user) {
          updateBalance(user.balance + finalEarnings);
        }
        
        setCurrentMining(null);
        setIsMining(false);
        setMiningProgress(100);
        setCurrentEarnings(finalEarnings);
      } else {
        updateMiningProgress(currentMining);
      }
    };

    updateProgress();
    const intervalId = setInterval(updateProgress, 1000);
    return () => clearInterval(intervalId);
  }, [currentMining, user, updateBalance, updateMiningProgress]);

  // Update mining rate when active plans change
  useEffect(() => {
    const updateCurrentMiningRate = async () => {
      if (!user || !currentMining || currentMining.status !== 'active') return;
      
      const newRate = calculateTotalMiningRate();
      
      if (newRate !== currentMining.rate) {
        const updatedSession = {
          ...currentMining,
          rate: newRate
        };
        
        try {
          await saveCurrentMining(user.id, updatedSession);
          setCurrentMining(updatedSession);
        } catch (error) {
          console.error("Error updating mining rate:", error);
        }
      }
    };
    
    updateCurrentMiningRate();
  }, [activePlans, calculateTotalMiningRate, currentMining, user]);

  return (
    <MiningContext.Provider
      value={{
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
      }}
    >
      {children}
    </MiningContext.Provider>
  );
};
