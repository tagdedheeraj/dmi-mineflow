import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  getCurrentMining, 
  saveCurrentMining, 
  clearCurrentMining,
  addToMiningHistory,
  checkAndUpdateMining,
  getActivePlans,
  saveActivePlan,
  updateUsdtEarnings
} from '@/lib/storage';
import { MiningSession, ActivePlan } from '@/types';
import { miningPlans as plansData } from '@/data/miningPlans';
import { useToast } from '@/hooks/use-toast';

interface MiningContextType {
  currentMining: MiningSession | null;
  miningProgress: number; // 0-100 percentage
  currentEarnings: number;
  timeRemaining: number; // in seconds
  miningRate: number; // coins per hour
  startMining: () => void;
  stopMining: () => void;
  isMining: boolean;
  activePlans: ActivePlan[];
  updateMiningBoost: (boostMultiplier: number, duration: number, planId: string) => void;
}

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
  updateMiningBoost: () => {},
});

export const useMining = () => useContext(MiningContext);

export const MiningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateBalance, updateUser } = useAuth();
  const { toast } = useToast();
  const [currentMining, setCurrentMining] = useState<MiningSession | null>(null);
  const [miningProgress, setMiningProgress] = useState(0);
  const [currentEarnings, setCurrentEarnings] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isMining, setIsMining] = useState(false);
  const [activePlans, setActivePlans] = useState<ActivePlan[]>([]);
  const [lastUsdtEarningsUpdate, setLastUsdtEarningsUpdate] = useState<string | null>(null);
  
  const baseMiningRate = 1;
  
  const calculateTotalMiningRate = useCallback(() => {
    let totalRate = baseMiningRate;
    
    activePlans.forEach(plan => {
      if (new Date() < new Date(plan.expiresAt)) {
        totalRate *= plan.boostMultiplier;
      }
    });
    
    return totalRate;
  }, [activePlans, baseMiningRate]);
  
  const miningRate = calculateTotalMiningRate();
  
  const MINING_DURATION = 24 * 60 * 60 * 1000;

  useEffect(() => {
    const plans = getActivePlans();
    setActivePlans(plans);
  }, []);

  useEffect(() => {
    const { updatedSession, earnedCoins } = checkAndUpdateMining();
    
    if (earnedCoins > 0 && user) {
      toast({
        title: "Mining Completed!",
        description: `You've earned ${earnedCoins} DMI Coins.`,
      });
      
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
  }, [user]);

  useEffect(() => {
    if (!user || activePlans.length === 0) return;
    
    const processDailyUsdtEarnings = () => {
      const today = new Date().toISOString().split('T')[0];
      
      if (lastUsdtEarningsUpdate === today) return;
      
      let totalDailyEarnings = 0;
      
      activePlans.forEach(plan => {
        if (new Date() >= new Date(plan.expiresAt)) return;
        
        const planInfo = plansData.find(p => p.id === plan.id);
        if (planInfo) {
          totalDailyEarnings += planInfo.dailyEarnings;
        }
      });
      
      if (totalDailyEarnings > 0) {
        const updatedUser = updateUsdtEarnings(totalDailyEarnings);
        if (updatedUser) {
          updateUser(updatedUser);
          
          toast({
            title: "Daily Earnings Added!",
            description: `${totalDailyEarnings.toFixed(2)} USDT has been added to your balance.`,
          });
        }
      }
      
      setLastUsdtEarningsUpdate(today);
    };
    
    processDailyUsdtEarnings();
    
    const intervalId = setInterval(processDailyUsdtEarnings, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [user, activePlans, lastUsdtEarningsUpdate, updateUser, toast]);

  useEffect(() => {
    if (!currentMining || currentMining.status !== 'active') {
      return;
    }

    const updateProgress = () => {
      const now = Date.now();
      const { startTime, endTime, rate } = currentMining;
      
      const totalDuration = endTime - startTime;
      const elapsed = now - startTime;
      const progress = Math.min((elapsed / totalDuration) * 100, 100);
      
      const remainingMs = Math.max(0, endTime - now);
      const remainingSec = Math.ceil(remainingMs / 1000);
      
      const elapsedHours = elapsed / (1000 * 60 * 60);
      const earnings = Math.floor(elapsedHours * rate);
      
      setMiningProgress(progress);
      setTimeRemaining(remainingSec);
      setCurrentEarnings(earnings);
      
      if (now >= endTime) {
        const finalEarnings = Math.floor((endTime - startTime) / (1000 * 60 * 60) * rate);
        
        const completedSession: MiningSession = {
          ...currentMining,
          status: 'completed',
          earned: finalEarnings
        };
        
        clearCurrentMining();
        addToMiningHistory(completedSession);
        
        if (user) {
          updateBalance(user.balance + finalEarnings);
        }
        
        setCurrentMining(null);
        setIsMining(false);
        setMiningProgress(100);
        setCurrentEarnings(finalEarnings);
        
        toast({
          title: "Mining Completed!",
          description: `You've earned ${finalEarnings} DMI Coins.`,
        });
      }
    };

    updateProgress();
    
    const intervalId = setInterval(updateProgress, 1000);
    
    return () => clearInterval(intervalId);
  }, [currentMining, user, updateBalance]);

  const startMining = useCallback(() => {
    const now = Date.now();
    
    const newSession: MiningSession = {
      startTime: now,
      endTime: now + MINING_DURATION,
      rate: miningRate,
      earned: 0,
      status: 'active'
    };
    
    saveCurrentMining(newSession);
    setCurrentMining(newSession);
    setIsMining(true);
    setMiningProgress(0);
    setCurrentEarnings(0);
    setTimeRemaining(MINING_DURATION / 1000);
    
    toast({
      title: "Mining Started",
      description: "Your mining operation has begun. Check back in 24 hours!",
    });
  }, [miningRate]);

  const stopMining = useCallback(() => {
    if (currentMining) {
      const now = Date.now();
      const elapsedHours = (now - currentMining.startTime) / (1000 * 60 * 60);
      const earnedCoins = Math.floor(elapsedHours * currentMining.rate);
      
      const completedSession: MiningSession = {
        ...currentMining,
        endTime: now,
        status: 'completed',
        earned: earnedCoins
      };
      
      clearCurrentMining();
      addToMiningHistory(completedSession);
      
      if (user) {
        updateBalance(user.balance + earnedCoins);
      }
      
      setCurrentMining(null);
      setIsMining(false);
      
      toast({
        title: "Mining Stopped",
        description: `You've earned ${earnedCoins} DMI Coins.`,
      });
    }
  }, [currentMining, user, updateBalance, toast]);

  const updateMiningBoost = useCallback((boostMultiplier: number, duration: number, planId: string) => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
    
    const newPlan: ActivePlan = {
      id: planId,
      purchasedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      boostMultiplier: boostMultiplier,
      duration: duration
    };
    
    saveActivePlan(newPlan);
    
    setActivePlans(prev => [...prev, newPlan]);
    
    if (currentMining && currentMining.status === 'active') {
      const updatedSession = {
        ...currentMining,
        rate: calculateTotalMiningRate(),
      };
      saveCurrentMining(updatedSession);
      setCurrentMining(updatedSession);
    }
    
    toast({
      title: "Mining Boost Activated",
      description: `Your mining speed is now increased by ${boostMultiplier}x for ${duration} days.`,
    });
  }, [calculateTotalMiningRate, currentMining, toast]);

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
      }}
    >
      {children}
    </MiningContext.Provider>
  );
};
