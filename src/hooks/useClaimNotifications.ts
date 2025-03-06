
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { miningPlans as plansData } from '@/data/miningPlans';
import { getPlanClaimStatus } from '@/lib/miningUtils';
import { ActivePlan } from '@/lib/storage';

export const useClaimNotifications = (
  activePlans: ActivePlan[],
) => {
  const { toast } = useToast();

  // Check for plans with available claims and send notifications
  useEffect(() => {
    const checkClaimableTimers = () => {
      activePlans.forEach(plan => {
        const { canClaim } = getPlanClaimStatus(plan);
        const planInfo = plansData.find(p => p.id === plan.id);
        
        if (canClaim && plan.lastClaimed !== 0 && planInfo) {
          // Only notify if this isn't the first claim (which is handled by purchase)
          // and if the plan has a next claim time that has passed
          toast({
            title: `USDT Ready to Claim!`,
            description: `Your ${planInfo.name} has USDT ready to claim. Go to the Plans page to claim it.`,
          });
        }
      });
    };
    
    // Check on component mount and every 5 minutes
    checkClaimableTimers();
    const intervalId = setInterval(checkClaimableTimers, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [activePlans, toast]);
};
