
export interface MiningContextType {
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
