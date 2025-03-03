
import { supabase } from "./client";
import { getUser } from "./users";
import { ActivePlan } from "./types";

// Plans operations
export const getActivePlans = async (): Promise<ActivePlan[]> => {
  const user = await getUser();
  if (!user) return [];
  
  try {
    const { data, error } = await supabase
      .from('active_plans')
      .select('*')
      .eq('user_id', user.id)
      .gte('expires_at', new Date().toISOString());
      
    if (error) {
      console.error('Error getting active plans:', error);
      return [];
    }
    
    return data.map(plan => ({
      id: plan.plan_id,
      purchasedAt: plan.purchased_at,
      expiresAt: plan.expires_at,
      boostMultiplier: plan.boost_multiplier,
      duration: plan.duration
    }));
  } catch (err) {
    console.error('Error in getActivePlans:', err);
    return [];
  }
};

export const saveActivePlan = async (plan: ActivePlan): Promise<void> => {
  const user = await getUser();
  if (!user) return;
  
  try {
    await supabase
      .from('active_plans')
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        purchased_at: plan.purchasedAt,
        expires_at: plan.expiresAt,
        boost_multiplier: plan.boostMultiplier,
        duration: plan.duration
      });
  } catch (err) {
    console.error('Error in saveActivePlan:', err);
  }
};
