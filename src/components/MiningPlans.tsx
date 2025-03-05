
import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, Check, ArrowRight } from 'lucide-react';
import { miningPlans, MiningPlan } from '@/data/miningPlans';
import { useToast } from '@/hooks/use-toast';
import { useMining } from '@/contexts/MiningContext';
import { formatNumber } from '@/lib/utils';
import PaymentModal from '@/components/PaymentModal';
import { updateUsdtEarnings } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';

const MiningPlans: React.FC = () => {
  const { toast } = useToast();
  const { updateMiningBoost, activePlans } = useMining();
  const { user, updateUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<MiningPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handlePurchase = (plan: MiningPlan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async (transactionId: string) => {
    if (!selectedPlan || !user) return;
    
    setShowPaymentModal(false);
    
    try {
      // First add to user's existing USDT earnings (not replace)
      const initialDailyEarning = selectedPlan.dailyEarnings;
      
      // Update USDT balance by adding the earnings to existing balance
      const currentUsdtEarnings = user.usdtEarnings || 0;
      const updatedUser = await updateUsdtEarnings(user.id, initialDailyEarning);
      
      if (updatedUser) {
        updateUser(updatedUser);
        
        // Update mining boost
        await updateMiningBoost(selectedPlan.miningBoost, selectedPlan.duration, selectedPlan.id);
        
        // Calculate current total mining boost after this plan
        let totalBoost = 1; // Base rate
        let totalDailyEarnings = initialDailyEarning;
        
        // Calculate total from existing active plans
        activePlans.forEach(plan => {
          if (new Date() < new Date(plan.expiresAt)) {
            const planInfo = miningPlans.find(p => p.id === plan.id);
            if (planInfo) {
              totalBoost += (planInfo.miningBoost - 1); // Add the boost (minus 1 to avoid double counting)
              totalDailyEarnings += planInfo.dailyEarnings;
            }
          }
        });
        
        // Add this plan's boost
        totalBoost += (selectedPlan.miningBoost - 1);
        
        toast({
          title: "Plan activated!",
          description: `Your ${selectedPlan.name} has been successfully activated. Mining speed is now ${totalBoost.toFixed(2)}x and you'll get ${totalDailyEarnings.toFixed(2)} USDT daily for ${selectedPlan.duration} days.`,
        });
      }
    } catch (error) {
      console.error("Error activating plan:", error);
      toast({
        title: "Error",
        description: "Failed to activate plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full rounded-xl overflow-hidden bg-white shadow-md border border-gray-100 card-hover-effect animate-fade-in mt-6">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Mining Plans</h3>
            <p className="text-sm text-gray-500 mt-1">
              Boost your mining speed and increase your earnings with our premium mining plans.
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
              2000% Boost
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4">
          {miningPlans.map((plan) => (
            <div key={plan.id} className="border border-gray-100 rounded-lg p-4 transition-all hover:shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{plan.name}</h4>
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
                <span>Purchase Now</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
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
