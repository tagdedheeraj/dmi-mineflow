
import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, Check, ArrowRight, Info, Clock } from 'lucide-react';
import { miningPlans, MiningPlan } from '@/data/miningPlans';
import { useToast } from '@/hooks/use-toast';
import { useMining } from '@/contexts/MiningContext';
import { formatNumber } from '@/lib/utils';
import PaymentModal from '@/components/PaymentModal';
import { useAuth } from '@/contexts/AuthContext';

const MiningPlans: React.FC = () => {
  const { toast } = useToast();
  const { updateMiningBoost, activePlans, miningRate, dailyEarningsUpdateTime } = useMining();
  const { user, updateUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<MiningPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
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
    if (isProcessing) return;
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async (transactionId: string) => {
    if (!selectedPlan || !user || isProcessing) return;
    
    setIsProcessing(true);
    setShowPaymentModal(false);
    
    try {
      console.log(`Processing payment completion for plan: ${selectedPlan.id}, transaction: ${transactionId}`);
      
      // Make sure we pass the planId so the system knows which plan to record as purchased today
      await updateMiningBoost(selectedPlan.miningBoost, selectedPlan.duration, selectedPlan.id);
      
      toast({
        title: "Plan activated!",
        description: `Your ${selectedPlan.name} has been successfully activated and your first day's earnings of $${selectedPlan.dailyEarnings.toFixed(2)} USDT have been added to your wallet.`,
      });
    } catch (error) {
      console.error("Error activating plan:", error);
      toast({
        title: "Error activating plan",
        description: "There was an error activating your plan. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  const totalBoost = activePlans.reduce((total, plan) => {
    if (new Date() < new Date(plan.expiresAt)) {
      return total * plan.boostMultiplier;
    }
    return total;
  }, 1);
  
  const boostPercentage = Math.round((totalBoost * 100) - 100);

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
            <div className="mt-3 space-y-2">
              <div className="text-sm bg-green-100 p-2 rounded-md text-green-700">
                <p className="font-medium">Active Plans: {activePlans.filter(plan => new Date() < new Date(plan.expiresAt)).length}</p>
                <p className="text-xs mt-1">You receive daily USDT earnings from each active plan</p>
              </div>
              
              <div className="flex items-center text-xs bg-blue-50 p-2 rounded-md text-blue-700">
                <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                <span>
                  Daily earnings are automatically credited at {dailyEarningsUpdateTime} every day
                  (Indian Standard Time)
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4">
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
                  disabled={isProcessing}
                >
                  <span>{isProcessing ? 'Processing...' : isActive ? 'Purchase Again' : 'Purchase Now'}</span>
                  {!isProcessing && <ArrowRight className="h-4 w-4" />}
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
