
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  MiningSession, 
  ActivePlan,
  getNextEarningsUpdateTime,
  setNextEarningsUpdateTime,
  updatePlanNextEarningTime
} from '@/lib/storage';
import { 
  getCurrentMining,
  saveCurrentMining,
  clearCurrentMining,
  addToMiningHistory,
  checkAndUpdateMining,
  getActivePlans,
  saveActivePlan,
  updateUsdtEarnings,
  getLastUsdtUpdateDate,
  updateLastUsdtUpdateDate,
  getUser
} from '@/lib/firestore';
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
  nextEarningsUpdate: number | null;
  timeToNextEarningsUpdate: number; // in seconds
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
  nextEarningsUpdate: null,
  timeToNextEarningsUpdate: 0,
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
  const [nextEarningsUpdate, setNextEarningsUpdate] = useState<number | null>(null);
  const [timeToNextEarningsUpdate, setTimeToNextEarningsUpdate] = useState(0);
  
  const [lastUsdtEarningsUpdate, setLastUsdtEarningsUpdate] = useState<string | null>(null);
  
  const baseMiningRate = 1;
  
  // Calculate total mining rate from all active plans - using ADDITION for boosts
  const calculateTotalMiningRate = useCallback(() => {
    let totalBoost = baseMiningRate;
    
    // Filter for active plans that haven't expired
    const validPlans = activePlans.filter(plan => new Date() < new Date(plan.expiresAt));
    
    if (validPlans.length > 0) {
      // Calculate total boost by ADDING all boosts together (not multiplying)
      validPlans.forEach(plan => {
        // We add the boost minus 1 (since boost is a multiplier)
        totalBoost += (plan.boostMultiplier - 1);
      });
    }
    
    return totalBoost;
  }, [activePlans, baseMiningRate]);
  
  const miningRate = calculateTotalMiningRate();
  
  const MINING_DURATION = 24 * 60 * 60 * 1000;

  useEffect(() => {
    const loadActivePlans = async () => {
      if (!user) return;
      
      try {
        const plans = await getActivePlans(user.id);
        setActivePlans(plans);
        
        // Check if we have any next earnings update times
        const nextUpdateTime = getNextEarningsUpdateTime();
        if (nextUpdateTime) {
          setNextEarningsUpdate(nextUpdateTime);
        } else if (plans.length > 0) {
          // If we have plans but no next update time, set one for 24 hours from now
          const newUpdateTime = Date.now() + 24 * 60 * 60 * 1000;
          setNextEarningsUpdate(newUpdateTime);
          setNextEarningsUpdateTime(newUpdateTime);
        }
      } catch (error) {
        console.error("Error loading active plans:", error);
      }
    };
    
    loadActivePlans();
  }, [user]);

  // Update the countdown timer for next earnings update
  useEffect(() => {
    if (!nextEarningsUpdate) return;
    
    const updateCountdown = () => {
      const now = Date.now();
      const timeRemaining = Math.max(0, nextEarningsUpdate - now);
      setTimeToNextEarningsUpdate(Math.floor(timeRemaining / 1000));
      
      // If countdown reached zero, process earnings update
      if (timeRemaining <= 0 && user && activePlans.length > 0) {
        processEarningsUpdate();
      }
    };
    
    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(intervalId);
  }, [nextEarningsUpdate, user, activePlans]);
  
  // Process earnings update when countdown reaches zero
  const processEarningsUpdate = useCallback(async () => {
    if (!user || activePlans.length === 0) return;
    
    let totalEarnings = 0;
    const earningDetails: {planName: string; amount: number}[] = [];
    
    // Only process active plans that haven't expired
    for (const plan of activePlans) {
      if (new Date() >= new Date(plan.expiresAt)) continue;
      
      const planInfo = plansData.find(p => p.id === plan.id);
      if (planInfo) {
        totalEarnings += planInfo.dailyEarnings;
        earningDetails.push({
          planName: planInfo.name,
          amount: planInfo.dailyEarnings
        });
      }
    }
    
    if (totalEarnings > 0) {
      try {
        const updatedUser = await updateUsdtEarnings(user.id, totalEarnings);
        if (updatedUser) {
          updateUser(updatedUser);
          
          // Send individual notifications for each plan
          earningDetails.forEach(detail => {
            toast({
              title: `Daily Earnings from ${detail.planName}`,
              description: `$${detail.amount.toFixed(2)} USDT has been added to your balance.`,
            });
          });
          
          // Send a summary notification
          if (earningDetails.length > 1) {
            toast({
              title: "Total Daily Earnings Added!",
              description: `$${totalEarnings.toFixed(2)} USDT has been added from all your mining plans.`,
            });
          }
          
          const today = new Date().toISOString().split('T')[0];
          await updateLastUsdtUpdateDate(user.id, today);
          setLastUsdtEarningsUpdate(today);
          
          // Set next earnings update time (24 hours from now)
          const newUpdateTime = Date.now() + 24 * 60 * 60 * 1000;
          setNextEarningsUpdate(newUpdateTime);
          setNextEarningsUpdateTime(newUpdateTime);
          
          // Update each active plan with the next earning time
          const updatedPlans = activePlans.map(plan => {
            if (new Date() < new Date(plan.expiresAt)) {
              return {
                ...plan,
                nextEarningUpdate: newUpdateTime
              };
            }
            return plan;
          });
          
          setActivePlans(updatedPlans);
          
          // Update each plan's next earning time in storage
          updatedPlans.forEach(plan => {
            if (plan.nextEarningUpdate) {
              updatePlanNextEarningTime(plan.id, plan.nextEarningUpdate);
            }
          });
        }
      } catch (error) {
        console.error("Error processing earnings update:", error);
      }
    }
  }, [user, activePlans, updateUser, toast]);

  useEffect(() => {
    const loadLastUpdateDate = async () => {
      if (!user) return;
      
      try {
        const lastUpdateDate = await getLastUsdtUpdateDate(user.id);
        if (lastUpdateDate) {
          setLastUsdtEarningsUpdate(lastUpdateDate);
        }
      } catch (error) {
        console.error("Error loading last update date:", error);
      }
    };
    
    loadLastUpdateDate();
  }, [user]);

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
          
          toast({
            title: "Mining Rate Updated",
            description: `Your mining rate is now ${newRate.toFixed(2)} DMI coins per hour.`,
          });
        } catch (error) {
          console.error("Error updating mining rate:", error);
        }
      }
    };
    
    updateCurrentMiningRate();
  }, [activePlans, calculateTotalMiningRate, currentMining, user, toast]);

  useEffect(() => {
    const checkMiningSession = async () => {
      if (!user) return;
      
      try {
        const { updatedSession, earnedCoins } = await checkAndUpdateMining(user.id);
        
        if (earnedCoins > 0) {
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
      } catch (error) {
        console.error("Error checking mining session:", error);
      }
    };
    
    checkMiningSession();
  }, [user, toast]);

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
        
        clearCurrentMining(currentMining.id!);
        addToMiningHistory(user.id, completedSession);
        
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
  }, [currentMining, user, updateBalance, toast]);

  const startMining = useCallback(async () => {
    if (!user) return;
    
    const now = Date.now();
    const currentRate = calculateTotalMiningRate();
    
    const newSession: MiningSession = {
      startTime: now,
      endTime: now + MINING_DURATION,
      rate: currentRate,
      earned: 0,
      status: 'active'
    };
    
    try {
      await saveCurrentMining(user.id, newSession);
      setCurrentMining(newSession);
      setIsMining(true);
      setMiningProgress(0);
      setCurrentEarnings(0);
      setTimeRemaining(MINING_DURATION / 1000);
      
      toast({
        title: "Mining Started",
        description: `Mining started at ${currentRate.toFixed(2)} DMI coins per hour.`,
      });
    } catch (error) {
      console.error("Error starting mining:", error);
      toast({
        title: "Mining Failed",
        description: "Failed to start mining. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, calculateTotalMiningRate, toast]);

  const stopMining = useCallback(async () => {
    if (!user || !currentMining) return;
    
    try {
      const now = Date.now();
      const elapsedHours = (now - currentMining.startTime) / (1000 * 60 * 60);
      const earnedCoins = Math.floor(elapsedHours * currentMining.rate);
      
      const completedSession: MiningSession = {
        ...currentMining,
        endTime: now,
        status: 'completed',
        earned: earnedCoins
      };
      
      await clearCurrentMining(currentMining.id!);
      await addToMiningHistory(user.id, completedSession);
      
      await updateBalance(user.balance + earnedCoins);
      
      setCurrentMining(null);
      setIsMining(false);
      
      toast({
        title: "Mining Stopped",
        description: `You've earned ${earnedCoins} DMI Coins.`,
      });
    } catch (error) {
      console.error("Error stopping mining:", error);
      toast({
        title: "Error",
        description: "Failed to stop mining. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentMining, user, updateBalance, toast]);

  const updateMiningBoost = useCallback(async (boostMultiplier: number, duration: number, planId: string) => {
    if (!user) return;
    
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
      
      // Set the next earnings update to 24 hours from now
      const nextEarningTime = now.getTime() + 24 * 60 * 60 * 1000;
      
      const newPlan: ActivePlan = {
        id: planId,
        purchasedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        boostMultiplier: boostMultiplier,
        duration: duration,
        nextEarningUpdate: nextEarningTime
      };
      
      await saveActivePlan(user.id, newPlan);
      setActivePlans(prev => [...prev, newPlan]);
      
      // Update next earnings time in storage
      setNextEarningsUpdateTime(nextEarningTime);
      setNextEarningsUpdate(nextEarningTime);
      
      const planInfo = plansData.find(p => p.id === planId);
      if (planInfo) {
        // Add immediate first day's earnings
        if (planInfo.dailyEarnings > 0) {
          const updatedUser = await updateUsdtEarnings(user.id, planInfo.dailyEarnings);
          if (updatedUser) {
            updateUser(updatedUser);
            
            toast({
              title: `${planInfo.name} Plan Activated!`,
              description: `$${planInfo.dailyEarnings.toFixed(2)} USDT has been added to your balance immediately as your first day's earnings. Next earnings will be added in 24 hours.`,
            });
          }
        }
        
        // Calculate total mining rate after adding new plan
        const newMiningRate = calculateTotalMiningRate() + (boostMultiplier - 1);
        
        // Notification for mining boost
        toast({
          title: "Mining Boost Activated",
          description: `Your mining speed is now increased to ${newMiningRate.toFixed(2)}x from the ${planInfo.name} plan.`,
        });
      }
      
      // Update current mining session with new rate if active
      if (currentMining && currentMining.status === 'active') {
        const newRate = calculateTotalMiningRate();
        const updatedSession = {
          ...currentMining,
          rate: newRate
        };
        
        await saveCurrentMining(user.id, updatedSession);
        setCurrentMining(updatedSession);
        
        toast({
          title: "Mining Speed Updated",
          description: `Your mining speed is now ${newRate.toFixed(2)}x faster!`,
        });
      }
      
      const today = new Date().toISOString().split('T')[0];
      await updateLastUsdtUpdateDate(user.id, today);
      setLastUsdtEarningsUpdate(today);
      
    } catch (error) {
      console.error("Error updating mining boost:", error);
      toast({
        title: "Error",
        description: "Failed to activate mining boost. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, calculateTotalMiningRate, currentMining, toast, updateUser]);

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
        nextEarningsUpdate,
        timeToNextEarningsUpdate
      }}
    >
      {children}
    </MiningContext.Provider>
  );
};
