
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  MiningSession, 
  ActivePlan,
  getNextUpdateTime,
  updatePlanEarningsSchedule,
  getNextScheduledEarningsUpdates
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
  nextEarningsUpdate: string | null; // Add this to show when next earnings are scheduled
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
  nextEarningsUpdate: null, // Initialize this property
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
  const [nextEarningsUpdate, setNextEarningsUpdate] = useState<string | null>(null);
  
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
        
        // Check for the next scheduled earnings update
        const scheduledUpdates = getNextScheduledEarningsUpdates();
        if (scheduledUpdates.length > 0) {
          setNextEarningsUpdate(scheduledUpdates[0].nextUpdate);
        }
      } catch (error) {
        console.error("Error loading active plans:", error);
      }
    };
    
    loadActivePlans();
  }, [user]);

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

  // Enhanced USDT earnings update with scheduled times for each plan
  useEffect(() => {
    if (!user || activePlans.length === 0) return;
    
    const processDailyUsdtEarnings = async () => {
      const now = new Date();
      const scheduledUpdates = getNextScheduledEarningsUpdates();
      
      if (scheduledUpdates.length === 0) return;
      
      // Check if any plan is due for an update
      for (const { planId, nextUpdate } of scheduledUpdates) {
        const nextUpdateTime = new Date(nextUpdate);
        
        if (now >= nextUpdateTime) {
          // Get the plan details
          const plan = activePlans.find(p => p.id === planId);
          if (!plan || new Date() >= new Date(plan.expiresAt)) continue;
          
          const planInfo = plansData.find(p => p.id === planId);
          if (planInfo) {
            try {
              // Add the daily earnings
              const updatedUser = await updateUsdtEarnings(user.id, planInfo.dailyEarnings);
              if (updatedUser) {
                updateUser(updatedUser);
                
                // Send notification
                toast({
                  title: `Daily Earnings from ${planInfo.name}`,
                  description: `$${planInfo.dailyEarnings.toFixed(2)} USDT has been added to your balance.`,
                });
                
                // Calculate and set the next update time (either 8 AM or midnight, whichever is next)
                const lastUpdate = now.toISOString();
                const nextUpdateTime = getNextUpdateTime();
                
                // Update the plan's last and next update times
                updatePlanEarningsSchedule(planId, lastUpdate, nextUpdateTime);
                
                // Also update the state
                setActivePlans(prevPlans => 
                  prevPlans.map(p => 
                    p.id === planId 
                      ? { ...p, lastEarningsUpdate: lastUpdate, nextEarningsUpdate: nextUpdateTime } 
                      : p
                  )
                );
                
                // Update the next earnings update time
                const refreshedSchedules = getNextScheduledEarningsUpdates();
                if (refreshedSchedules.length > 0) {
                  setNextEarningsUpdate(refreshedSchedules[0].nextUpdate);
                }
                
                console.log(`Plan ${planId} updated with earnings. Next update: ${nextUpdateTime}`);
              }
            } catch (error) {
              console.error(`Error processing daily USDT earnings for plan ${planId}:`, error);
            }
          }
        }
      }
    };
    
    processDailyUsdtEarnings();
    
    // Check for updates every minute
    const intervalId = setInterval(processDailyUsdtEarnings, 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [user, activePlans, updateUser, toast]);

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
      
      // Calculate the next update time (either 8 AM or midnight, whichever is next)
      const nextUpdateTime = getNextUpdateTime();
      
      const newPlan: ActivePlan = {
        id: planId,
        purchasedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        boostMultiplier: boostMultiplier,
        duration: duration,
        lastEarningsUpdate: now.toISOString(),
        nextEarningsUpdate: nextUpdateTime
      };
      
      await saveActivePlan(user.id, newPlan);
      setActivePlans(prev => [...prev, newPlan]);
      
      // Update the next earnings update time
      const refreshedSchedules = getNextScheduledEarningsUpdates();
      if (refreshedSchedules.length > 0) {
        setNextEarningsUpdate(refreshedSchedules[0].nextUpdate);
      }
      
      const planInfo = plansData.find(p => p.id === planId);
      if (planInfo) {
        // Add immediate first day's earnings
        if (planInfo.dailyEarnings > 0) {
          const updatedUser = await updateUsdtEarnings(user.id, planInfo.dailyEarnings);
          if (updatedUser) {
            updateUser(updatedUser);
            
            toast({
              title: `${planInfo.name} Plan Activated!`,
              description: `$${planInfo.dailyEarnings.toFixed(2)} USDT has been added to your balance immediately as your first day's earnings. Next earnings update at: ${new Date(nextUpdateTime).toLocaleString()}.`,
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
      
      await updateLastUsdtUpdateDate(user.id, new Date().toISOString().split('T')[0]);
      setLastUsdtEarningsUpdate(new Date().toISOString().split('T')[0]);
      
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
      }}
    >
      {children}
    </MiningContext.Provider>
  );
};
