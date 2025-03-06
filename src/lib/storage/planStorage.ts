
/**
 * Plan storage service to manage active plans
 */
import { ActivePlan, STORAGE_KEYS } from './types';
import { updateUsdtEarnings } from './userStorage';
import { getUser } from './userStorage';

// Plans operations
export const getActivePlans = (): ActivePlan[] => {
  const plansJson = localStorage.getItem(STORAGE_KEYS.ACTIVE_PLANS);
  const plans = plansJson ? JSON.parse(plansJson) : [];
  
  // Filter out expired plans
  const now = new Date();
  return plans.filter((plan: ActivePlan) => new Date(plan.expiresAt) > now);
};

export const saveActivePlan = (plan: ActivePlan): void => {
  const plans = getActivePlans();
  
  // Set initial claim times when creating a new plan
  if (!plan.lastClaimed) {
    plan.lastClaimed = 0; // No claims yet
    plan.nextClaimTime = Date.now(); // Can claim immediately after purchase
  }
  
  plans.push(plan);
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PLANS, JSON.stringify(plans));
};

export const updateActivePlan = (planId: string, updates: Partial<ActivePlan>): ActivePlan | null => {
  const plans = getActivePlans();
  const planIndex = plans.findIndex(p => p.id === planId);
  
  if (planIndex === -1) return null;
  
  // Update plan with new values
  plans[planIndex] = { ...plans[planIndex], ...updates };
  
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PLANS, JSON.stringify(plans));
  return plans[planIndex];
};

export const claimPlanUsdtEarnings = (planId: string, amount: number): { 
  success: boolean, 
  planUpdated: ActivePlan | null 
} => {
  const now = Date.now();
  const user = getUser();
  if (!user) return { success: false, planUpdated: null };
  
  const plans = getActivePlans();
  const planIndex = plans.findIndex(p => p.id === planId);
  
  if (planIndex === -1) return { success: false, planUpdated: null };
  
  const plan = plans[planIndex];
  
  // Check if the plan is claimable (next claim time has passed)
  if (plan.nextClaimTime && now < plan.nextClaimTime) {
    return { success: false, planUpdated: null };
  }
  
  // Update plan's last claimed time
  plan.lastClaimed = now;
  // Set next claim time to 24 hours from now
  plan.nextClaimTime = now + (24 * 60 * 60 * 1000);
  
  // Update in storage
  plans[planIndex] = plan;
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PLANS, JSON.stringify(plans));
  
  console.log(`Claiming USDT earnings for plan ${planId}: $${amount}`);
  
  // Add USDT earnings to user's balance - use the exact amount passed (daily earnings)
  updateUsdtEarnings(amount);
  
  return { success: true, planUpdated: plan };
};
