
import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, RefreshCw } from 'lucide-react';
import { miningPlans, MiningPlan, getPlans, reloadPlans } from '@/data/miningPlans';
import { useToast } from '@/hooks/use-toast';
import { useMining } from '@/contexts/MiningContext';
import { useAuth } from '@/contexts/AuthContext';
import { getUser } from '@/lib/firestore';
import PaymentModal from '@/components/PaymentModal';
import MiningBoostCard from './mining/MiningBoostCard';
import EarningsStatsCard from './mining/EarningsStatsCard';
import PlansList from './mining/PlansList';
import LoadingPlans from './mining/LoadingPlans';

const MiningPlans: React.FC = () => {
  const { toast } = useToast();
  const { updateMiningBoost, activePlans, miningRate } = useMining();
  const { user, updateUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<MiningPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<MiningPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  
  useEffect(() => {
    loadPlans();
  }, []);
  
  const loadPlans = async () => {
    setIsLoadingPlans(true);
    try {
      const plans = await getPlans();
      setAvailablePlans(plans);
    } catch (error) {
      console.error("Error loading plans:", error);
      setAvailablePlans(miningPlans); // Fallback to default plans
    } finally {
      setIsLoadingPlans(false);
    }
  };
  
  const handleRefreshPlans = async () => {
    try {
      const refreshedPlans = await reloadPlans();
      setAvailablePlans(refreshedPlans);
      toast({
        title: "Plans Refreshed",
        description: "The latest mining plans have been loaded.",
      });
    } catch (error) {
      console.error("Error refreshing plans:", error);
      toast({
        title: "Error",
        description: "Failed to refresh plans. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const currentDailyEarnings = activePlans.reduce((total, plan) => {
    const planInfo = availablePlans.find(p => p.id === plan.id) || 
                    miningPlans.find(p => p.id === plan.id);
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
      console.log(`[PURCHASE DEBUG] Processing payment completion for plan: ${selectedPlan.id}, transaction: ${transactionId}`);
      console.log(`[PURCHASE DEBUG] Plan details - boost: ${selectedPlan.miningBoost}, duration: ${selectedPlan.duration}, dailyEarnings: ${selectedPlan.dailyEarnings}, price: ${selectedPlan.price}`);
      console.log(`[PURCHASE DEBUG] User purchasing plan: ${user.id}, has referrer: ${user.appliedReferralCode ? 'yes' : 'no'}`);
      
      // Make sure we pass the planId, dailyEarnings and price to properly record the purchase
      const activePlan = await updateMiningBoost(
        selectedPlan.miningBoost, 
        selectedPlan.duration, 
        selectedPlan.id,
        selectedPlan.dailyEarnings,
        selectedPlan.price
      );
      
      console.log(`[PURCHASE DEBUG] Plan activation result:`, activePlan);
      
      // Multiple attempts to get updated user data after plan activation
      console.log("[PURCHASE DEBUG] First attempt to get updated user data");
      let updatedUser = await getUser(user.id);
      
      if (!updatedUser || (updatedUser.usdtEarnings === 0 && selectedPlan.dailyEarnings > 0)) {
        console.log("[PURCHASE DEBUG] First attempt didn't return expected USDT earnings, waiting and trying again");
        // Wait a bit and try again
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("[PURCHASE DEBUG] Second attempt to get updated user data");
        updatedUser = await getUser(user.id);
      }
      
      console.log(`[PURCHASE DEBUG] Updated user after plan purchase:`, updatedUser);
      
      if (updatedUser) {
        updateUser(updatedUser);
        
        console.log(`[PURCHASE DEBUG] User USDT earnings after update: ${updatedUser.usdtEarnings}`);
        
        toast({
          title: "Plan activated!",
          description: `Your ${selectedPlan.name} has been successfully activated and your first day's earnings of $${selectedPlan.dailyEarnings.toFixed(2)} USDT have been added to your wallet. Future earnings need to be claimed daily.`,
        });
      }
    } catch (error) {
      console.error("[PURCHASE DEBUG] Error activating plan:", error);
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

  if (isLoadingPlans) {
    return <LoadingPlans />;
  }

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
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center" 
              onClick={handleRefreshPlans}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <div className="bg-yellow-500/10 text-yellow-600 p-2 rounded-lg">
              <Zap className="h-5 w-5" />
            </div>
          </div>
        </div>

        <MiningBoostCard 
          boostPercentage={boostPercentage} 
          miningRate={miningRate} 
        />
        
        <EarningsStatsCard
          currentDailyEarnings={currentDailyEarnings}
          currentWeeklyEarnings={currentWeeklyEarnings}
          currentMonthlyEarnings={currentMonthlyEarnings}
          activePlans={activePlans}
        />

        <PlansList 
          availablePlans={availablePlans}
          activePlans={activePlans}
          isProcessing={isProcessing}
          onPurchase={handlePurchase}
        />
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
