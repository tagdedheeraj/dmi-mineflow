
import { useCallback } from 'react';
import { 
  MiningSession,
  saveCurrentMining,
  clearCurrentMining,
  addToMiningHistory
} from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useMiningOperations = (
  currentMining: MiningSession | null,
  setCurrentMining: React.Dispatch<React.SetStateAction<MiningSession | null>>,
  setIsMining: React.Dispatch<React.SetStateAction<boolean>>,
  miningRate: number,
  MINING_DURATION: number
) => {
  const { user, updateBalance } = useAuth();
  const { toast } = useToast();

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
    
    toast({
      title: "Mining Started",
      description: `Mining started at ${currentRate.toFixed(2)} DMI coins per hour.`,
    });
  }, [user, miningRate, toast, MINING_DURATION, setCurrentMining, setIsMining]);

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
  }, [currentMining, user, updateBalance, toast, setCurrentMining, setIsMining]);

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
  }, [currentMining, toast, setCurrentMining]);

  return {
    startMining,
    stopMining,
    updateMiningRate
  };
};
