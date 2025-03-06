
import { useState, useEffect } from 'react';
import { 
  MiningSession,
  getCurrentMining,
  checkAndUpdateMining,
} from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { calculateTotalMiningRate } from '@/lib/miningUtils';
import { useProgressTracking } from './useProgressTracking';
import { useMiningOperations } from './useMiningOperations';

export const useMiningSession = (activePlans: any[]) => {
  const { user, updateBalance } = useAuth();
  const { toast } = useToast();
  const [currentMining, setCurrentMining] = useState<MiningSession | null>(null);
  const [isMining, setIsMining] = useState(false);
  
  const MINING_DURATION = 24 * 60 * 60 * 1000;
  const baseMiningRate = 1;
  
  // Calculate current mining rate
  const miningRate = calculateTotalMiningRate(activePlans, baseMiningRate);

  // Use the progress tracking hook
  const {
    miningProgress,
    currentEarnings,
    timeRemaining
  } = useProgressTracking(currentMining, setCurrentMining, setIsMining);

  // Use the mining operations hook
  const {
    startMining,
    stopMining,
    updateMiningRate
  } = useMiningOperations(currentMining, setCurrentMining, setIsMining, miningRate, MINING_DURATION);

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
