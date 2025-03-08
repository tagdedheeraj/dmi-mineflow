
import { useCallback, useState } from 'react';
import { MiningSession, ActivePlan } from '@/lib/storage';

interface UseMiningCalculationsProps {
  activePlans: ActivePlan[];
  baseMiningRate?: number;
}

export const useMiningCalculations = ({ 
  activePlans,
  baseMiningRate = 1
}: UseMiningCalculationsProps) => {
  const [miningProgress, setMiningProgress] = useState(0);
  const [currentEarnings, setCurrentEarnings] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  const calculateTotalMiningRate = useCallback(() => {
    let totalBoost = baseMiningRate;
    
    const validPlans = activePlans.filter(plan => new Date() < new Date(plan.expiresAt));
    
    if (validPlans.length > 0) {
      validPlans.forEach(plan => {
        totalBoost += (plan.boostMultiplier - 1);
      });
    }
    
    return totalBoost;
  }, [activePlans, baseMiningRate]);
  
  const updateMiningProgress = useCallback((currentMining: MiningSession | null) => {
    if (!currentMining || currentMining.status !== 'active') {
      return { progress: 0, earnings: 0, remainingSec: 0 };
    }
    
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
    
    return { progress, earnings, remainingSec };
  }, []);
  
  return {
    miningProgress,
    setMiningProgress,
    currentEarnings,
    setCurrentEarnings,
    timeRemaining,
    setTimeRemaining,
    calculateTotalMiningRate,
    updateMiningProgress
  };
};
