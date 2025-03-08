
import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { miningPlans, MiningPlan } from '@/data/miningPlans';
import { useToast } from '@/hooks/use-toast';
import { useMining } from '@/contexts/MiningContext';
import { useAuth } from '@/contexts/AuthContext';
import PaymentModal from '@/components/PaymentModal';
import MiningBoostCard from '@/components/plans/MiningBoostCard';
import UsdtEarningsCard from '@/components/plans/UsdtEarningsCard';
import PlanCard from '@/components/plans/PlanCard';

const MiningPlans: React.FC = () => {
  const { toast } = useToast();
  const { updateMiningBoost, activePlans, miningRate, dailyEarningsUpdateTime } = useMining();
  const { user } = useAuth();
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
      console.log("Processing plan purchase for referral commissions...");
      console.log("Plan details:", selectedPlan);
      
      // Call the mining boost update function which will also handle first day earnings
      // and immediate referral commission based on plan cost
      await updateMiningBoost(selectedPlan.miningBoost, selectedPlan.duration, selectedPlan.id);
      
      // Log to verify the function was called
      console.log("Plan activated and mining boost updated");
      
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
    }
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

        {/* Mining Boost Card */}
        <MiningBoostCard activePlans={activePlans} miningRate={miningRate} />
        
        {/* USDT Earnings Card */}
        <UsdtEarningsCard 
          activePlans={activePlans} 
          miningPlans={miningPlans} 
          dailyEarningsUpdateTime={dailyEarningsUpdateTime} 
        />

        {/* Plan Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4">
          {miningPlans.map((plan) => {
            const isActive = activePlans.some(p => p.id === plan.id && new Date() < new Date(p.expiresAt));
            
            return (
              <PlanCard 
                key={plan.id} 
                plan={plan} 
                isActive={isActive} 
                onPurchase={handlePurchase} 
              />
            );
          })}
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
