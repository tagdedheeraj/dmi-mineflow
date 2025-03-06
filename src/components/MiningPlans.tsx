
import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, Check, ArrowRight, Info, DollarSign, Clock } from 'lucide-react';
import { miningPlans, MiningPlan } from '@/data/miningPlans';
import { useToast } from '@/hooks/use-toast';
import { useMining } from '@/contexts/MiningContext';
import { formatNumber } from '@/lib/utils';
import PaymentModal from '@/components/PaymentModal';
import { useAuth } from '@/contexts/AuthContext';

const MiningPlans: React.FC = () => {
  const { toast } = useToast();
  const { updateMiningBoost, activePlans, miningRate, claimDailyUsdt } = useMining();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<MiningPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [claimingPlanId, setClaimingPlanId] = useState<string | null>(null);
  
  const currentDailyEarnings = activePlans.reduce((total, plan) => {
    const planInfo = miningPlans.find(p => p.id === plan.id);
    if (planInfo && new Date() < new Date(plan.expiresAt)) {
      return total + planInfo.dailyEarnings;
    }
    return total;
  }, 0);
  
  const currentWeeklyEarnings = currentDailyEarnings * 7;
  const currentMonthlyEarnings = currentDailyEarnings * 30;

  const handlePurchase = (plan: MiningPlan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = (transactionId: string) => {
    if (!selectedPlan) return;
    
    setShowPaymentModal(false);
    
    toast({
      title: "Plan activated!",
      description: `Your ${selectedPlan.name} has been successfully activated.`,
    });
    
    updateMiningBoost(selectedPlan.miningBoost, selectedPlan.duration, selectedPlan.id);
  };

  const handleClaimDailyUsdt = async (planId: string) => {
    setClaimingPlanId(planId);
    
    try {
      const planInfo = miningPlans.find(p => p.id === planId);
      if (!planInfo) return;
      
      const result = await claimDailyUsdt(planId);
      
      if (result.success) {
        toast({
          title: "USDT Claimed!",
          description: `You've successfully claimed $${planInfo.dailyEarnings.toFixed(2)} USDT from your ${planInfo.name} plan.`,
        });
      } else {
        toast({
          title: "Claim Failed",
          description: result.message || "You've already claimed your USDT for today.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error claiming USDT:", error);
      toast({
        title: "Claim Failed",
        description: "An error occurred while claiming your USDT.",
        variant: "destructive",
      });
    } finally {
      setClaimingPlanId(null);
    }
  };

  const totalBoost = activePlans.reduce((total, plan) => {
    if (new Date() < new Date(plan.expiresAt)) {
      return total * plan.boostMultiplier;
    }
    return total;
  }, 1);
  
  const boostPercentage = Math.round((totalBoost * 100) - 100);

  // Check if a plan is claimable (hasn't been claimed in the last 24 hours)
  const isClaimable = (planId: string) => {
    const plan = activePlans.find(p => p.id === planId);
    if (!plan) return false;
    
    // Check if the plan is active
    if (new Date() >= new Date(plan.expiresAt)) return false;
    
    // Check if the plan has been claimed in the last 24 hours
    const lastClaimed = plan.lastClaimed ? new Date(plan.lastClaimed) : null;
    if (!lastClaimed) return true;
    
    const now = new Date();
    const timeDiff = now.getTime() - lastClaimed.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    return hoursDiff >= 24;
  };

  // Calculate time remaining until next claim for a plan
  const getTimeUntilNextClaim = (planId: string) => {
    const plan = activePlans.find(p => p.id === planId);
    if (!plan || !plan.lastClaimed) return null;
    
    const lastClaimed = new Date(plan.lastClaimed);
    const nextClaimTime = new Date(lastClaimed.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    
    if (now >= nextClaimTime) return null;
    
    const timeRemaining = nextClaimTime.getTime() - now.getTime();
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hoursRemaining}h ${minutesRemaining}m`;
  };

  return (
    <div className="w-full rounded-xl overflow-hidden bg-white shadow-md border border-gray-100 card-hover-effect animate-fade-in mt-6">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Arbitrage Plans</h3>
            <p className="text-sm text-gray-500 mt-1">
              Boost your mining speed and increase your earnings with our premium arbitrage plans.
            </p>
          </div>
          <div className="bg-yellow-500/10 text-yellow-600 p-2 rounded-lg">
            <Zap className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Your Mining Boost</p>
              <p className="text-lg font-medium">Faster mining means more earnings</p>
            </div>
            <div className="bg-yellow-500/20 text-yellow-700 px-3 py-1 rounded-md font-semibold">
              {boostPercentage}% Boost
            </div>
          </div>
          
          <div className="mt-3 text-sm flex items-center text-blue-600 bg-blue-50 p-2 rounded-md">
            <Info className="h-4 w-4 mr-2" />
            <span>Your current mining speed is {miningRate.toFixed(2)}x</span>
          </div>
        </div>
        
        <div className="mt-6 bg-green-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-medium text-green-700">USDT Earnings from Plans</p>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white p-2 rounded shadow-sm">
              <p className="text-xs text-gray-500">Daily</p>
              <p className="text-green-600 font-bold">${currentDailyEarnings.toFixed(2)}</p>
            </div>
            <div className="bg-white p-2 rounded shadow-sm">
              <p className="text-xs text-gray-500">Weekly</p>
              <p className="text-green-600 font-bold">${currentWeeklyEarnings.toFixed(2)}</p>
            </div>
            <div className="bg-white p-2 rounded shadow-sm">
              <p className="text-xs text-gray-500">Monthly</p>
              <p className="text-green-600 font-bold">${currentMonthlyEarnings.toFixed(2)}</p>
            </div>
          </div>
          
          {activePlans.length > 0 && (
            <div className="mt-3 text-sm bg-green-100 p-2 rounded-md text-green-700">
              <p className="font-medium">Active Plans: {activePlans.filter(plan => new Date() < new Date(plan.expiresAt)).length}</p>
              <p className="text-xs mt-1">Claim your daily USDT earnings from each active plan every 24 hours</p>
            </div>
          )}
        </div>

        {/* Active Plans Section with Claim Buttons */}
        {activePlans.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-4">Your Active Plans</h4>
            <div className="grid grid-cols-1 gap-4">
              {activePlans.filter(plan => new Date() < new Date(plan.expiresAt)).map((plan) => {
                const planInfo = miningPlans.find(p => p.id === plan.id);
                if (!planInfo) return null;
                
                const canClaim = isClaimable(plan.id);
                const timeUntilNextClaim = getTimeUntilNextClaim(plan.id);
                
                return (
                  <div key={plan.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{planInfo.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">Expires: {new Date(plan.expiresAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-green-600 font-semibold">${planInfo.dailyEarnings.toFixed(2)}/day</div>
                    </div>
                    
                    <div className="mt-4">
                      {canClaim ? (
                        <Button 
                          variant="default" 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => handleClaimDailyUsdt(plan.id)}
                          disabled={claimingPlanId === plan.id}
                        >
                          {claimingPlanId === plan.id ? (
                            "Claiming..."
                          ) : (
                            <>
                              <DollarSign className="h-4 w-4 mr-2" />
                              Claim Daily USDT
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-md text-center flex items-center justify-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span className="text-sm">Next claim in {timeUntilNextClaim || "24h"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4">
          <h4 className="font-medium text-gray-900">Available Plans</h4>
          {miningPlans.map((plan) => {
            const isActive = activePlans.some(p => p.id === plan.id && new Date() < new Date(p.expiresAt));
            
            return (
              <div key={plan.id} className={`border rounded-lg p-4 transition-all hover:shadow-md ${isActive ? 'border-green-300 bg-green-50' : 'border-gray-100'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium text-gray-900">{plan.name}</h4>
                      {isActive && (
                        <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{plan.duration} days</p>
                  </div>
                  <div className="text-xl font-bold text-gray-900">${plan.price}</div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span>${plan.dailyEarnings} daily earnings</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span>{plan.miningBoost}x faster mining</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span>${plan.totalEarnings} total earnings</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span>{plan.withdrawalTime}</span>
                  </div>
                </div>
                
                {plan.limitedTo && (
                  <p className="mt-2 text-xs text-red-500 font-medium">{plan.limitedTo}</p>
                )}
                
                <Button 
                  className="w-full mt-4 flex justify-center items-center space-x-2"
                  onClick={() => handlePurchase(plan)}
                >
                  <span>{isActive ? 'Purchase Again' : 'Purchase Now'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {showPaymentModal && selectedPlan && (
        <PaymentModal
          planId={selectedPlan.id}
          planName={selectedPlan.name}
          planPrice={selectedPlan.price}
          onClose={() => setShowPaymentModal(false)}
          onComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default MiningPlans;
