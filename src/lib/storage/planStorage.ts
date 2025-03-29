
import { ActivePlan, STORAGE_KEYS } from './types';

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
  plans.push(plan);
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PLANS, JSON.stringify(plans));
};
