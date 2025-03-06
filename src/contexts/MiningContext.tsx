
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  MiningSession, 
  ActivePlan,
  getActivePlans,
  saveActivePlan,
  updateUsdtEarnings,
  claimPlanUsdtEarnings,
  updateActivePlan,
  getCurrentMining,
  saveCurrentMining,
  clearCurrentMining,
  addToMiningHistory,
  checkAndUpdateMining
} from '@/lib/storage';
import { miningPlans as plansData } from '@/data/miningPlans';
import { useToast } from '@/hooks/use-toast';
import { formatDuration } from '@/lib/utils';

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
  claimPlanEarnings: (planId: string) => void;
  getPlanClaimTime: (planId: string) => { 
    canClaim: boolean;
    timeRemaining: number;
    formattedTimeRemaining: string;
  };
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
  claimPlanEarnings: () => {},
  getPlanClaimTime: () => ({ canClaim: false, timeRemaining: 0, formattedTimeRemaining: "00:00:00" }),
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

  // Load active plans
  useEffect(() => {
    if (user) {
      const plans = getActivePlans();
      setActivePlans(plans);
    }
  }, [user]);

  // Calculate plan claim status
  const getPlanClaimTime = useCallback((planId: string) => {
    const plan = activePlans.find(p => p.id === planId);
    const now = Date.now();
    
    if (!plan || !plan.nextClaimTime) {
      return { 
        canClaim: true,
        timeRemaining: 0,
        formattedTimeRemaining: "00:00:00" 
      };
    }
    
    const canClaim = now >= plan.nextClaimTime;
    const timeRemaining = Math.max(0, plan.nextClaimTime - now);
    
    // Convert to seconds for formatting
    const timeRemainingSeconds = Math.ceil(timeRemaining / 1000);
    const formattedTimeRemaining = formatDuration(timeRemainingSeconds);
    
    return {
      canClaim,
      timeRemaining,
      formattedTimeRemaining
    };
  }, [activePlans]);

  // Claim plan earnings
  const claimPlanEarnings = useCallback((planId: string) => {
    if (!user) return;
    
    const planInfo = plansData.find(p => p.id === planId);
    if (!planInfo) return;
    
    const { success, planUpdated } = claimPlanUsdtEarnings(planId, planInfo.dailyEarnings);
    
    if (success && planUpdated) {
      // Update the active plans list
      setActivePlans(prev => 
        prev.map(p => p.id === planId ? planUpdated : p)
      );
      
      // Update the user info
      const updatedUser = getUser();
      if (updatedUser) {
        updateUser(updatedUser);
      }
      
      // Show notification
      toast({
        title: "USDT Claimed!",
        description: `You have claimed $${planInfo.dailyEarnings.toFixed(2)} USDT from your ${planInfo.name}.`,
      });
    } else {
      // Show error notification
      const { formattedTimeRemaining } = getPlanClaimTime(planId);
      toast({
        title: "Cannot Claim Yet",
        description: `Please wait ${formattedTimeRemaining} before claiming again.`,
        variant: "destructive",
      });
    }
  }, [user, updateUser, toast, getPlanClaimTime]);

  // Update mining check
  useEffect(() => {
    const checkMiningSession = () => {
      if (!user) return;
      
      const { updatedSession, earnedCoins } = checkAndUpdateMining();
      
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
        
        // Also update user balance
        updateBalance(user.balance + earnedCoins);
      } 
      else if (updatedSession && updatedSession.status === 'active') {
        setCurrentMining(updatedSession);
        setIsMining(true);
      }
    };
    
    checkMiningSession();
    
    // Check every minute
    const intervalId = setInterval(checkMiningSession, 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [user, toast, updateBalance]);

  // Countdown timer for active mining
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
  }, [currentMining, user, updateBalance, toast]);

  const startMining = useCallback(() => {
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
    
    saveCurrentMining(newSession);
    setCurrentMining(newSession);
    setIsMining(true);
    setMiningProgress(0);
    setCurrentEarnings(0);
    setTimeRemaining(MINING_DURATION / 1000);
    
    toast({
      title: "Mining Started",
      description: `Mining started at ${currentRate.toFixed(2)} DMI coins per hour.`,
    });
  }, [user, calculateTotalMiningRate, toast]);

  const stopMining = useCallback(() => {
    if (!user || !currentMining) return;
    
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
    
    updateBalance(user.balance + earnedCoins);
    
    setCurrentMining(null);
    setIsMining(false);
    
    toast({
      title: "Mining Stopped",
      description: `You've earned ${earnedCoins} DMI Coins.`,
    });
  }, [currentMining, user, updateBalance, toast]);

  const updateMiningBoost = useCallback((boostMultiplier: number, duration: number, planId: string) => {
    if (!user) return;
    
    const now = new Date();
    const expiresAt = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
    
    const newPlan: ActivePlan = {
      id: planId,
      purchasedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      boostMultiplier: boostMultiplier,
      duration: duration,
      lastClaimed: 0, // Never claimed yet
      nextClaimTime: now.getTime() // Can claim immediately after purchase
    };
    
    saveActivePlan(newPlan);
    setActivePlans(prev => [...prev, newPlan]);
    
    const planInfo = plansData.find(p => p.id === planId);
    if (planInfo) {
      // Show notification about available claim
      toast({
        title: `${planInfo.name} Activated!`,
        description: `Your plan is active and you can claim your first daily USDT earnings now.`,
      });
      
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
      
      saveCurrentMining(updatedSession);
      setCurrentMining(updatedSession);
      
      toast({
        title: "Mining Speed Updated",
        description: `Your mining speed is now ${newRate.toFixed(2)}x faster!`,
      });
    }
  }, [user, calculateTotalMiningRate, currentMining, toast]);

  // Check for plans with available claims and send notifications
  useEffect(() => {
    const checkClaimableTimers = () => {
      activePlans.forEach(plan => {
        const { canClaim } = getPlanClaimTime(plan.id);
        const planInfo = plansData.find(p => p.id === plan.id);
        
        if (canClaim && plan.lastClaimed !== 0 && planInfo) {
          // Only notify if this isn't the first claim (which is handled by purchase)
          // and if the plan has a next claim time that has passed
          toast({
            title: `USDT Ready to Claim!`,
            description: `Your ${planInfo.name} has USDT ready to claim. Go to the Plans page to claim it.`,
          });
        }
      });
    };
    
    // Check on component mount and every 5 minutes
    checkClaimableTimers();
    const intervalId = setInterval(checkClaimableTimers, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [activePlans, getPlanClaimTime, toast]);

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
        claimPlanEarnings,
        getPlanClaimTime
      }}
    >
      {children}
    </MiningContext.Provider>
  );
};
