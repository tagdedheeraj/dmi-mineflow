
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getActivePlans, updateActivePlanClaimTime, addUsdtTransaction, updateUsdtEarnings } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, DollarSign } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { miningPlans } from '@/data/miningPlans';

const UsdtClaimCard: React.FC = () => {
  const { toast } = useToast();
  const { user, updateUser } = useAuth();
  const [activePlans, setActivePlans] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadActivePlans();
    const interval = setInterval(() => {
      loadActivePlans();
      updateCountdowns();
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const loadActivePlans = () => {
    const plans = getActivePlans();
    const now = Date.now();
    
    // Filter only arbitrage plans (not boosters) and add additional info
    const enhancedPlans = plans.map(plan => {
      const planDetails = miningPlans.find(p => p.id === plan.id);
      return {
        ...plan,
        name: planDetails?.name || 'Unknown Plan',
        dailyEarnings: plan.dailyEarnings || planDetails?.dailyEarnings || 0,
        canClaim: plan.nextClaimTime ? now >= plan.nextClaimTime : true
      };
    });
    
    setActivePlans(enhancedPlans);
    
    // Initialize loading state for each plan
    const newLoadingState: Record<string, boolean> = {};
    enhancedPlans.forEach(plan => {
      if (!loading[plan.id]) {
        newLoadingState[plan.id] = false;
      } else {
        newLoadingState[plan.id] = loading[plan.id];
      }
    });
    setLoading(newLoadingState);
    
    updateCountdowns();
  };

  const updateCountdowns = () => {
    const now = Date.now();
    const newTimeLeft: Record<string, number> = {};
    
    activePlans.forEach(plan => {
      if (plan.nextClaimTime && plan.nextClaimTime > now) {
        newTimeLeft[plan.id] = Math.ceil((plan.nextClaimTime - now) / 1000);
      } else {
        newTimeLeft[plan.id] = 0;
      }
    });
    
    setTimeLeft(newTimeLeft);
  };

  const handleClaimUsdt = async (planId: string, amount: number, planName: string) => {
    if (!user) return;
    
    setLoading(prev => ({ ...prev, [planId]: true }));
    
    try {
      // 1. Update the plan's claim time
      const updatedPlan = updateActivePlanClaimTime(planId);
      
      if (!updatedPlan) {
        toast({
          title: "Error",
          description: "Could not find plan information. Please try again.",
          variant: "destructive"
        });
        setLoading(prev => ({ ...prev, [planId]: false }));
        return;
      }
      
      // 2. Add to user's USDT earnings
      const updatedUser = updateUsdtEarnings(amount);
      
      if (updatedUser) {
        updateUser(updatedUser);
      }
      
      // 3. Record the transaction
      const transaction = {
        id: uuidv4(),
        amount,
        timestamp: Date.now(),
        planId,
        planName
      };
      
      addUsdtTransaction(transaction);
      
      // 4. Show success toast
      toast({
        title: "USDT Claimed Successfully",
        description: `$${amount.toFixed(2)} USDT has been added to your balance.`,
      });
      
      // 5. Refresh the active plans
      loadActivePlans();
    } catch (error) {
      console.error("Error claiming USDT:", error);
      toast({
        title: "Claim Failed",
        description: "An error occurred while claiming your USDT. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, [planId]: false }));
    }
  };

  if (activePlans.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden animate-fade-in">
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-lg font-medium text-gray-900">USDT Daily Earnings</h3>
        <p className="text-sm text-gray-500 mt-1">
          Claim your daily USDT earnings from your active arbitrage plans
        </p>
      </div>
      
      <div className="p-5">
        <div className="space-y-4">
          {activePlans.map(plan => (
            <div key={plan.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{plan.name}</h4>
                <span className="text-green-600 font-bold">${plan.dailyEarnings.toFixed(2)}/day</span>
              </div>
              
              <div className="flex justify-between items-center mt-3">
                {plan.canClaim ? (
                  <Button
                    onClick={() => handleClaimUsdt(plan.id, plan.dailyEarnings, plan.name)}
                    disabled={loading[plan.id]}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <DollarSign className="h-4 w-4" />
                    {loading[plan.id] ? 'Processing...' : 'Claim USDT'}
                  </Button>
                ) : (
                  <div className="w-full bg-gray-100 p-2 rounded flex items-center justify-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Next claim in {formatDuration(timeLeft[plan.id] || 0)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsdtClaimCard;
