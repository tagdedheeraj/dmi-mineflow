
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
  updateLastUsdtUpdateDate,
  getUser,
  updatePlanLastClaimed
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
  claimDailyUsdt: (planId: string) => Promise<{success: boolean; message?: string}>;
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
  claimDailyUsdt: async () => ({success: false}),
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
      } catch (error) {
        console.error("Error loading active plans:", error);
      }
    };
    
    loadActivePlans();
  }, [user]);

  // Add claimDailyUsdt function to claim daily rewards manually
  const claimDailyUsdt = async (planId: string): Promise<{success: boolean; message?: string}> => {
    if (!user) return {success: false, message: "User not authenticated"};
    
    try {
      // Find the plan in active plans
      const plan = activePlans.find(p => p.id === planId);
      if (!plan) return {success: false, message: "Plan not found"};
      
      // Check if plan is expired
      if (new Date() >= new Date(plan.expiresAt)) {
        return {success: false, message: "This plan has expired"};
      }
      
      // Check if user has already claimed in the last 24 hours
      if (plan.lastClaimed) {
        const lastClaimed = new Date(plan.lastClaimed);
        const now = new Date();
        const timeDiff = now.getTime() - lastClaimed.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          return {
            success: false, 
            message: `You can claim again in ${Math.ceil(24 - hoursDiff)} hours`
          };
        }
      }
      
      // Find plan info to get daily earnings amount
      const planInfo = plansData.find(p => p.id === planId);
      if (!planInfo) return {success: false, message: "Plan information not found"};
      
      // Update the lastClaimed timestamp for this plan
      const now = new Date().toISOString();
      await updatePlanLastClaimed(user.id, planId, now);
      
      // Update local state
      setActivePlans(prev => prev.map(p => 
        p.id === planId ? {...p, lastClaimed: now} : p
      ));
      
      // Add USDT earnings to user's balance
      const updatedUser = await updateUsdtEarnings(user.id, planInfo.dailyEarnings);
      if (updatedUser) {
        updateUser(updatedUser);
      }
      
      return {success: true};
    } catch (error) {
      console.error("Error claiming daily USDT:", error);
      return {success: false, message: "An error occurred while claiming"};
    }
  };

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

  // Enhanced USDT earnings update with notifications for each plan
  useEffect(() => {
    if (!user || activePlans.length === 0) return;
    
    const processDailyUsdtEarnings = async () => {
      // Auto-claim feature has been disabled in favor of manual claiming
      // Code kept for reference but will not automatically add earnings
    };
    
    processDailyUsdtEarnings();
    
    // Check for daily updates every hour
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
        duration: duration,
        lastClaimed: now.toISOString() // Set lastClaimed to now so user gets immediate earnings
      };
      
      await saveActivePlan(user.id, newPlan);
      setActivePlans(prev => [...prev, newPlan]);
      
      const planInfo = plansData.find(p => p.id === planId);
      if (planInfo) {
        // Add immediate first day's earnings
        if (planInfo.dailyEarnings > 0) {
          const updatedUser = await updateUsdtEarnings(user.id, planInfo.dailyEarnings);
          if (updatedUser) {
            updateUser(updatedUser);
            
            toast({
              title: `${planInfo.name} Plan Activated!`,
              description: `$${planInfo.dailyEarnings.toFixed(2)} USDT has been added to your balance immediately as your first day's earnings.`,
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
        claimDailyUsdt,
      }}
    >
      {children}
    </MiningContext.Provider>
  );
};

export default MiningProvider;
