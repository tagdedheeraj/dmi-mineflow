
import { useState, useCallback, useEffect } from 'react';
import { MiningSession } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { getCurrentMining, saveCurrentMining, clearCurrentMining, addToMiningHistory } from '@/lib/firestore';

export const useMiningSession = (
  userId: string | undefined, 
  updateBalance: (balance: number) => void, 
  calculateRate: () => number
) => {
  const { toast } = useToast();
  const [currentMining, setCurrentMining] = useState<MiningSession | null>(null);
  const [isMining, setIsMining] = useState(false);
  
  const MINING_DURATION = 4 * 60 * 60 * 1000; // 4 hours

  // Load current mining session on mount
  useEffect(() => {
    const loadCurrentMining = async () => {
      if (!userId) return;
      
      try {
        const session = await getCurrentMining(userId);
        if (session) {
          setCurrentMining(session);
          setIsMining(true);
        }
      } catch (error) {
        console.error("Error loading current mining session:", error);
      }
    };
    
    loadCurrentMining();
  }, [userId]);

  const startMining = useCallback(async () => {
    if (!userId) return;
    
    const now = Date.now();
    const currentRate = calculateRate();
    
    const newSession: MiningSession = {
      id: '',
      startTime: now,
      endTime: now + MINING_DURATION,
      rate: currentRate,
      earned: 0,
      status: 'active'
    };
    
    try {
      await saveCurrentMining(userId, newSession);
      const savedSession = await getCurrentMining(userId);
      
      if (savedSession) {
        setCurrentMining(savedSession);
        setIsMining(true);
        
        toast({
          title: "Mining Started",
          description: `Mining started at ${currentRate.toFixed(2)} DMI coins per hour.`,
        });
      }
    } catch (error) {
      console.error("Error starting mining:", error);
      toast({
        title: "Mining Failed",
        description: "Failed to start mining. Please try again.",
        variant: "destructive",
      });
    }
  }, [userId, calculateRate, toast]);

  const stopMining = useCallback(async () => {
    if (!userId || !currentMining) return;
    
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
      
      await clearCurrentMining(currentMining.id);
      await addToMiningHistory(userId, completedSession);
      
      if (earnedCoins > 0) {
        updateBalance(earnedCoins);
      }
      
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
  }, [currentMining, userId, updateBalance, toast]);

  return {
    currentMining,
    setCurrentMining,
    isMining,
    setIsMining,
    startMining,
    stopMining
  };
};
