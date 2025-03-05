
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  MiningSession, 
  ActivePlan
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
  updateLastUsdtUpdateDate
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
  
  // Updated calculation method to properly multiply boost multipliers
  const calculateTotalMiningRate = useCallback(() => {
    let totalRate = baseMiningRate;
    
    // Check for active plans and multiply their boost values
    const validPlans = activePlans.filter(plan => new Date() < new Date(plan.expiresAt));
    
    if (validPlans.length > 0) {
      // Start with the base rate and multiply by each plan's boost
      validPlans.forEach(plan => {
        totalRate *= plan.boostMultiplier;
      });
    }
    
    return totalRate;
  }, [activePlans, baseMiningRate]);
  
  const miningRate = calculateTotalMiningRate();
  
  const MINING_DURATION = 24 * 60 * 60 * 1000;

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

  // Effect to update the current mining session when active plans change
  useEffect(() => {
    const updateCurrentMiningRate = async () => {
      if (!user || !currentMining || currentMining.status !== 'active') return;
      
      const newRate = calculateTotalMiningRate();
      
      // Only update if the rate has changed
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

  // Completely revised USDT earnings processing to ensure correct daily amounts
  useEffect(() => {
    if (!user || activePlans.length === 0) return;
    
    const processDailyUsdtEarnings = async () => {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Only process once per day
      if (lastUsdtEarningsUpdate === today) return;
      
      let totalDailyEarnings = 0;
      
      // Calculate the exact daily earnings from active plans based on their plan data
      for (const plan of activePlans) {
        // Skip expired plans
        if (new Date() >= new Date(plan.expiresAt)) continue;
        
        // Find the plan details from plan data
        const planInfo = plansData.find(p => p.id === plan.id);
        if (planInfo) {
          // Use the exact daily earnings value from the plan data
          totalDailyEarnings += planInfo.dailyEarnings;
        }
      }
      
      // Only proceed if there are earnings to add
      if (totalDailyEarnings > 0) {
        try {
          // Update the user's USDT earnings with the exact calculated amount
          const updatedUser = await updateUsdtEarnings(user.id, totalDailyEarnings);
          if (updatedUser) {
            updateUser(updatedUser);
            
            toast({
              title: "Daily Earnings Added!",
              description: `${totalDailyEarnings.toFixed(2)} USDT has been added to your balance from your mining plans.`,
            });
            
            // Update the last update date
            await updateLastUsdtUpdateDate(user.id, today);
            setLastUsdtEarningsUpdate(today);
          }
        } catch (error) {
          console.error("Error processing daily USDT earnings:", error);
        }
      }
    };
    
    // Run immediately and then set up an interval to check periodically
    processDailyUsdtEarnings();
    
    const intervalId = setInterval(processDailyUsdtEarnings, 60 * 60 * 1000); // Check every hour
    
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
      
      const newPlan: ActivePlan = {
        id: planId,
        purchasedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        boostMultiplier: boostMultiplier,
        duration: duration
      };
      
      await saveActivePlan(user.id, newPlan);
      
      setActivePlans(prev => [...prev, newPlan]);
      
      // Update current mining session with new rate if one exists
      if (currentMining && currentMining.status === 'active') {
        const newRate = calculateTotalMiningRate();
        const updatedSession = {
          ...currentMining,
          rate: newRate
        };
        
        await saveCurrentMining(user.id, updatedSession);
        setCurrentMining(updatedSession);
      }
      
      toast({
        title: "Mining Boost Activated",
        description: `Your mining speed is now increased by ${boostMultiplier}x for ${duration} days.`,
      });
    } catch (error) {
      console.error("Error updating mining boost:", error);
      toast({
        title: "Error",
        description: "Failed to activate mining boost. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, calculateTotalMiningRate, currentMining, toast]);

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
