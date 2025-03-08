
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

// Create the context
const MiningContext = createContext<MiningContextType | undefined>(undefined);

// Provider component
export const MiningProvider: React.FC<MiningProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;
  
  // Initialize state
  const [activePlans, setActivePlans] = useState<ActivePlan[]>([]);
  const [dailyEarningsUpdateTime, setDailyEarningsUpdateTime] = useState<string>('12:01 AM');
  
  // Use custom hooks for mining functionality
  const { updateMiningBoost } = usePlanManagement(userId);
  const { miningRate } = useMiningCalculations(activePlans);
  const { 
    currentMining, 
    setCurrentMining,
    miningProgress, 
    currentEarnings, 
    timeRemaining,
    isMining
  } = useMiningSession(userId, miningRate);

  // Process daily USDT earnings
  useDailyEarnings(userId, activePlans, miningPlans, setDailyEarningsUpdateTime);

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
  
  // Start mining function
  const startMining = useCallback(async () => {
    if (!userId || isMining) return;
    
    try {
      const now = Date.now();
      
      // Calculate mining end time (limited to 4 hours)
      const endTime = now + (4 * 60 * 60 * 1000);
      
      // Create new mining session
      const newSession: MiningSession = {
        id: '',
        startTime: now,
        endTime,
        rate: miningRate,
        earned: 0,
        status: 'active'
      };
      
      // Save to Firestore and update state
      await saveCurrentMining(userId, newSession);
      
      // Get the updated session from Firestore
      const updatedSession = await getCurrentMining(userId);
      if (updatedSession) {
        setCurrentMining(updatedSession);
      }
      
    } catch (error) {
      console.error("Error starting mining:", error);
    }
  }, [userId, isMining, miningRate, setCurrentMining]);
  
  // Stop mining function
  const stopMining = useCallback(async () => {
    if (!userId || !isMining || !currentMining?.id) return;
    
    try {
      const now = Date.now();
      const elapsedHours = (now - currentMining.startTime) / (1000 * 60 * 60);
      const earnedCoins = Math.floor(elapsedHours * currentMining.rate);
      
      // Create completed session object
      const completedSession: MiningSession = {
        ...currentMining,
        endTime: now,
        earned: earnedCoins,
        status: 'completed'
      };
      
      // Update in Firestore
      await clearCurrentMining(currentMining.id);
      await addToMiningHistory(userId, completedSession);
      
      // Update user balance
      await updateUserBalance(userId, earnedCoins);
      
      // Clear current mining state
      setCurrentMining(null);
      
    } catch (error) {
      console.error("Error stopping mining:", error);
    }
  }, [userId, isMining, currentMining, setCurrentMining]);
  
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
    dailyEarningsUpdateTime
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
