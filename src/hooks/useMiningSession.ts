
import { useState, useEffect, useCallback } from 'react';
import { 
  MiningSession,
  getCurrentMining,
  saveCurrentMining,
  clearCurrentMining,
  addToMiningHistory,
  checkAndUpdateMining,
} from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { calculateTotalMiningRate } from '@/lib/miningUtils';

export const useMiningSession = (activePlans: any[]) => {
  const { user, updateBalance } = useAuth();
  const { toast } = useToast();
  const [currentMining, setCurrentMining] = useState<MiningSession | null>(null);
  const [miningProgress, setMiningProgress] = useState(0);
  const [currentEarnings, setCurrentEarnings] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isMining, setIsMining] = useState(false);
  
  const MINING_DURATION = 24 * 60 * 60 * 1000;
  const baseMiningRate = 1;
  
  // Calculate current mining rate
  const miningRate = calculateTotalMiningRate(activePlans, baseMiningRate);

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
    const currentRate = miningRate;
    
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
  }, [user, miningRate, toast]);

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

  // Update current mining session with new rate if active
  const updateMiningRate = useCallback((newRate: number) => {
    if (currentMining && currentMining.status === 'active') {
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
  }, [currentMining, toast]);

  return {
    currentMining,
    miningProgress,
    currentEarnings,
    timeRemaining,
    miningRate,
    startMining,
    stopMining,
    isMining,
    updateMiningRate
  };
};
