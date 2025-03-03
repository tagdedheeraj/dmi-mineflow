
import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, Check, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMining } from '@/contexts/MiningContext';
import PaymentModal from '@/components/PaymentModal';

export interface BoosterPlan {
  id: string;
  name: string;
  price: number;
  miningBoost: number;
  duration: number;
  description: string;
}

const boosterPlans: BoosterPlan[] = [
  {
    id: "basic-boost",
    name: "Basic Booster",
    price: 10,
    miningBoost: 1.3,
    duration: 30,
    description: "30% faster mining for 30 days"
  },
  {
    id: "standard-boost",
    name: "Standard Booster",
    price: 20,
    miningBoost: 2,
    duration: 30,
    description: "2x faster mining for 30 days"
  },
  {
    id: "premium-boost",
    name: "Premium Booster",
    price: 50,
    miningBoost: 5,
    duration: 30,
    description: "5x faster mining for 30 days"
  },
  {
    id: "elite-boost",
    name: "Elite Booster",
    price: 100,
    miningBoost: 10,
    duration: 30,
    description: "10x faster mining for 30 days"
  },
  {
    id: "pro-boost",
    name: "Pro Booster",
    price: 200,
    miningBoost: 25,
    duration: 30,
    description: "25x faster mining for 30 days"
  },
  {
    id: "ultimate-boost",
    name: "Ultimate Booster",
    price: 500,
    miningBoost: 60,
    duration: 30,
    description: "60x faster mining for 30 days"
  },
  {
    id: "supreme-boost",
    name: "Supreme Booster",
    price: 1000,
    miningBoost: 100,
    duration: 50,
    description: "100x faster mining for 50 days"
  },
  {
    id: "legend-boost",
    name: "Legend Booster",
    price: 2000,
    miningBoost: 150,
    duration: 70,
    description: "150x faster mining for 70 days"
  }
];

const DMIBooster: React.FC = () => {
  const { toast } = useToast();
  const { updateMiningBoost } = useMining();
  const [selectedPlan, setSelectedPlan] = useState<BoosterPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handlePurchase = (plan: BoosterPlan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = (transactionId: string) => {
    if (!selectedPlan) return;
    
    setShowPaymentModal(false);
    
    toast({
      title: "Booster activated!",
      description: `Your ${selectedPlan.name} has been successfully activated.`,
    });
    
    // Update mining boost with the purchased plan
    updateMiningBoost(selectedPlan.miningBoost, selectedPlan.duration, selectedPlan.id);
  };

  return (
    <div className="w-full rounded-xl overflow-hidden bg-white shadow-md border border-gray-100 card-hover-effect animate-fade-in mt-6">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">DMI Boosters</h3>
            <p className="text-sm text-gray-500 mt-1">
              Supercharge your mining speed with these special boosters
            </p>
          </div>
          <div className="bg-yellow-500/10 text-yellow-600 p-2 rounded-lg">
            <Zap className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4">
          {boosterPlans.map((plan) => (
            <div key={plan.id} className="border border-gray-100 rounded-lg p-4 transition-all hover:shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{plan.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{plan.duration} days</p>
                </div>
                <div className="text-xl font-bold text-gray-900">${plan.price}</div>
              </div>
              
              <div className="mt-2">
                <div className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>{plan.description}</span>
                </div>
                <div className="bg-yellow-500/20 text-yellow-700 px-3 py-1 rounded-md font-semibold mt-2 inline-block">
                  {plan.miningBoost}x Mining Speed
                </div>
              </div>
              
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

export default DMIBooster;
