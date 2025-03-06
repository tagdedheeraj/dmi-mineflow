
import { ActivePlan } from './storage';
import { formatDuration } from './utils';

/**
 * Calculate the total mining rate based on active plans
 */
export const calculateTotalMiningRate = (activePlans: ActivePlan[], baseMiningRate: number = 1): number => {
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
};

/**
 * Get claim status and time for a plan
 */
export const getPlanClaimStatus = (plan: ActivePlan | undefined): { 
  canClaim: boolean;
  timeRemaining: number;
  formattedTimeRemaining: string;
} => {
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
};
