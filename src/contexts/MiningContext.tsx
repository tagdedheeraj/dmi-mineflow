
import React, { createContext, useContext, useEffect } from 'react';
import { MiningContextType } from '@/types/mining';
import { useMiningPlans } from '@/hooks/useMiningPlans';
import { useMiningSession } from '@/hooks/useMiningSession';
import { useClaimNotifications } from '@/hooks/useClaimNotifications';
import { useToast } from '@/hooks/use-toast';
import { calculateTotalMiningRate } from '@/lib/miningUtils';

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
  claimPlanEarnings: (planId: string) => {
    console.log(`MiningContext attempting to claim plan: ${planId}`);
  },
  getPlanClaimTime: () => ({ canClaim: false, timeRemaining: 0, formattedTimeRemaining: "00:00:00" }),
});

export const useMining = () => useContext(MiningContext);

export const MiningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  // Get plans management
  const {
    activePlans,
    getPlanClaimTime,
    claimPlanEarnings,
    updateMiningBoost: baseUpdateMiningBoost,
  } = useMiningPlans();
  
  // Get mining session management
  const {
    currentMining,
    miningProgress,
    currentEarnings,
    timeRemaining,
    isMining,
    miningRate,
    startMining,
    stopMining,
    updateMiningRate
  } = useMiningSession(activePlans);

  // Set up claim notifications
  useClaimNotifications(activePlans);

  // Enhanced updateMiningBoost that also updates mining rate
  const updateMiningBoost = (boostMultiplier: number, duration: number, planId: string) => {
    const newPlan = baseUpdateMiningBoost(boostMultiplier, duration, planId);
    if (!newPlan) return;
    
    // Calculate total mining rate after adding new plan
    const newMiningRate = calculateTotalMiningRate([...activePlans, newPlan]);
    
    // Notification for mining boost
    toast({
      title: "Mining Boost Activated",
      description: `Your mining speed is now increased to ${newMiningRate.toFixed(2)}x.`,
    });
    
    // Update current mining session with new rate
    updateMiningRate(newMiningRate);
  };

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
        claimPlanEarnings: (planId: string) => {
          console.log(`MiningContext wrapper calling claimPlanEarnings with planId: ${planId}`);
          claimPlanEarnings(planId);
        },
        getPlanClaimTime
      }}
    >
      {children}
    </MiningContext.Provider>
  );
};
