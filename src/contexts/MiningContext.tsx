import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  MiningSession, 
  getCurrentMining, 
  saveCurrentMining, 
  clearCurrentMining,
  addToMiningHistory,
  checkAndUpdateMining,
  getActivePlans,
  saveActivePlan,
  ActivePlan
} from '@/lib/storage';
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
  const { user, updateBalance } = useAuth();
  const { toast } = useToast();
  const [currentMining, setCurrentMining] = useState<MiningSession | null>(null);
  const [miningProgress, setMiningProgress] = useState(0);
  const [currentEarnings, setCurrentEarnings] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isMining, setIsMining] = useState(false);
  const [activePlans, setActivePlans] = useState<ActivePlan[]>([]);
  
  // Base mining rate: 1 DMI per hour
  const baseMiningRate = 1;
  
  // Calculate total mining rate including boosts from active plans
  const calculateTotalMiningRate = useCallback(() => {
    // Start with base rate
    let totalRate = baseMiningRate;
    
    // Add boosts from active plans
    activePlans.forEach(plan => {
      if (new Date() < new Date(plan.expiresAt)) {
        totalRate *= plan.boostMultiplier;
      }
    });
    
    return totalRate;
  }, [activePlans, baseMiningRate]);
  
  // Get miningRate using the calculated total
  const miningRate = calculateTotalMiningRate();
  
  // Duration of mining session in milliseconds (24 hours)
  const MINING_DURATION = 24 * 60 * 60 * 1000;

  // Load active plans
  useEffect(() => {
    const plans = getActivePlans();
    setActivePlans(plans);
  }, []);

  // Check for existing mining session on load
  useEffect(() => {
    const { updatedSession, earnedCoins } = checkAndUpdateMining();
    
    if (earnedCoins > 0 && user) {
      // Show notification for completed mining
      toast({
        title: "Mining Completed!",
        description: `You've earned ${earnedCoins} DMI Coins.`,
      });
      
      // Update UI state
      setCurrentMining(null);
      setIsMining(false);
      setMiningProgress(0);
      setCurrentEarnings(0);
      setTimeRemaining(0);
    } 
    else if (updatedSession && updatedSession.status === 'active') {
      // Resume active mining session
      setCurrentMining(updatedSession);
      setIsMining(true);
    }
  }, [user]);

  // Update mining progress regularly
  useEffect(() => {
    if (!currentMining || currentMining.status !== 'active') {
      return;
    }

    const updateProgress = () => {
      const now = Date.now();
      const { startTime, endTime, rate } = currentMining;
      
      // Calculate progress percentage
      const totalDuration = endTime - startTime;
      const elapsed = now - startTime;
      const progress = Math.min((elapsed / totalDuration) * 100, 100);
      
      // Calculate time remaining in seconds
      const remainingMs = Math.max(0, endTime - now);
      const remainingSec = Math.ceil(remainingMs / 1000);
      
      // Calculate current earnings
      const elapsedHours = elapsed / (1000 * 60 * 60);
      const earnings = Math.floor(elapsedHours * rate);
      
      setMiningProgress(progress);
      setTimeRemaining(remainingSec);
      setCurrentEarnings(earnings);
      
      // Check if mining has completed
      if (now >= endTime) {
        const finalEarnings = Math.floor((endTime - startTime) / (1000 * 60 * 60) * rate);
        
        // Update mining session status
        const completedSession: MiningSession = {
          ...currentMining,
          status: 'completed',
          earned: finalEarnings
        };
        
        // Update storage and context
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

    // Update immediately
    updateProgress();
    
    // Then update every second
    const intervalId = setInterval(updateProgress, 1000);
    
    return () => clearInterval(intervalId);
  }, [currentMining, user, updateBalance]);

  // Start mining session
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

  // Stop mining session (for demo purposes, normally would continue)
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

  // Add a new plan and update mining boost
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
    
    // Save to storage
    saveActivePlan(newPlan);
    
    // Update state
    setActivePlans(prev => [...prev, newPlan]);
    
    // If there's an active mining session, update its rate
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
