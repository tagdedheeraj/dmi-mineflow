
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
  ActivePlan,
  updateUsdtEarnings,
  getLastEarningsUpdateDate,
  setLastEarningsUpdateDate
} from '@/lib/supabase';
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
  
  // Track the last date when daily USDT earnings were processed
  const [lastUsdtEarningsUpdate, setLastUsdtEarningsUpdate] = useState<string | null>(null);
  
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
    const loadActivePlans = async () => {
      if (!user) return;
      
      const plans = await getActivePlans();
      setActivePlans(plans);
    };
    
    if (user) {
      loadActivePlans();
    }
  }, [user]);

  // Load last earnings update date
  useEffect(() => {
    const loadLastUpdateDate = async () => {
      if (!user) return;
      
      const lastUpdateDate = await getLastEarningsUpdateDate();
      if (lastUpdateDate) {
        setLastUsdtEarningsUpdate(lastUpdateDate);
      }
    };
    
    if (user) {
      loadLastUpdateDate();
    }
  }, [user]);

  // Check for existing mining session on load
  useEffect(() => {
    const checkMiningStatus = async () => {
      if (!user) return;
      
      const { updatedSession, earnedCoins } = await checkAndUpdateMining();
      
      if (earnedCoins > 0) {
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
    };
    
    if (user) {
      checkMiningStatus();
    }
  }, [user, toast]);

  // Process daily USDT earnings from active plans
  useEffect(() => {
    const processDailyUsdtEarnings = async () => {
      if (!user || activePlans.length === 0) return;
      
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // If we've already processed earnings today, skip
      if (lastUsdtEarningsUpdate === today) return;
      
      // Calculate total daily earnings from all active plans
      let totalDailyEarnings = 0;
      
      activePlans.forEach(plan => {
        // Skip if plan has expired
        if (new Date() >= new Date(plan.expiresAt)) return;
        
        // Find plan info to get daily earnings amount
        const planInfo = plansData.find(p => p.id === plan.id);
        if (planInfo) {
          totalDailyEarnings += planInfo.dailyEarnings;
        }
      });
      
      // Add earnings if we have any
      if (totalDailyEarnings > 0) {
        const updatedUser = await updateUsdtEarnings(totalDailyEarnings);
        if (updatedUser) {
          updateUser(updatedUser);
          
          toast({
            title: "Daily Earnings Added!",
            description: `${totalDailyEarnings.toFixed(2)} USDT has been added to your balance.`,
          });
          
          // Update the last update date in database
          await setLastEarningsUpdateDate(today);
          // Update state
          setLastUsdtEarningsUpdate(today);
        }
      }
    };
    
    if (user && activePlans.length > 0) {
      processDailyUsdtEarnings();
      
      // Set up interval to check only once per hour (to handle day change)
      const intervalId = setInterval(processDailyUsdtEarnings, 60 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [user, activePlans, lastUsdtEarningsUpdate, updateUser, toast]);

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
        
        // Update mining session status asynchronously
        const completeMining = async () => {
          // Update mining session status
          const completedSession: MiningSession = {
            ...currentMining,
            status: 'completed',
            earned: finalEarnings
          };
          
          // Update storage and context
          await clearCurrentMining();
          await addToMiningHistory(completedSession);
          
          if (user) {
            await updateBalance(user.balance + finalEarnings);
          }
          
          setCurrentMining(null);
          setIsMining(false);
          setMiningProgress(100);
          setCurrentEarnings(finalEarnings);
          
          toast({
            title: "Mining Completed!",
            description: `You've earned ${finalEarnings} DMI Coins.`,
          });
        };
        
        completeMining();
      }
    };

    // Update immediately
    updateProgress();
    
    // Then update every second
    const intervalId = setInterval(updateProgress, 1000);
    
    return () => clearInterval(intervalId);
  }, [currentMining, user, updateBalance, toast]);

  // Start mining session
  const startMining = useCallback(async () => {
    if (!user) return;
    
    const now = Date.now();
    
    const newSession: MiningSession = {
      startTime: now,
      endTime: now + MINING_DURATION,
      rate: miningRate,
      earned: 0,
      status: 'active'
    };
    
    await saveCurrentMining(newSession);
    setCurrentMining(newSession);
    setIsMining(true);
    setMiningProgress(0);
    setCurrentEarnings(0);
    setTimeRemaining(MINING_DURATION / 1000);
    
    toast({
      title: "Mining Started",
      description: "Your mining operation has begun. Check back in 24 hours!",
    });
  }, [miningRate, user, toast]);

  // Stop mining session
  const stopMining = useCallback(async () => {
    if (!currentMining || !user) return;
    
    const now = Date.now();
    const elapsedHours = (now - currentMining.startTime) / (1000 * 60 * 60);
    const earnedCoins = Math.floor(elapsedHours * currentMining.rate);
    
    const completedSession: MiningSession = {
      ...currentMining,
      endTime: now,
      status: 'completed',
      earned: earnedCoins
    };
    
    await clearCurrentMining();
    await addToMiningHistory(completedSession);
    
    await updateBalance(user.balance + earnedCoins);
    
    setCurrentMining(null);
    setIsMining(false);
    
    toast({
      title: "Mining Stopped",
      description: `You've earned ${earnedCoins} DMI Coins.`,
    });
  }, [currentMining, user, updateBalance, toast]);

  // Add a new plan and update mining boost
  const updateMiningBoost = useCallback(async (boostMultiplier: number, duration: number, planId: string) => {
    if (!user) return;
    
    const now = new Date();
    const expiresAt = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
    
    const newPlan: ActivePlan = {
      id: planId,
      purchasedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      boostMultiplier: boostMultiplier,
      duration: duration
    };
    
    // Save to database
    await saveActivePlan(newPlan);
    
    // Update state
    setActivePlans(prev => [...prev, newPlan]);
    
    // If there's an active mining session, update its rate
    if (currentMining && currentMining.status === 'active') {
      const updatedRate = calculateTotalMiningRate();
      const updatedSession = {
        ...currentMining,
        rate: updatedRate,
      };
      await saveCurrentMining(updatedSession);
      setCurrentMining(updatedSession);
    }
    
    toast({
      title: "Mining Boost Activated",
      description: `Your mining speed is now increased by ${boostMultiplier}x for ${duration} days.`,
    });
  }, [calculateTotalMiningRate, currentMining, user, toast]);

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
