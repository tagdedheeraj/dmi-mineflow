
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DMIBooster as DMIBoosterType, dmiBoosters } from '@/data/dmiBoosters';
import { useMining } from '@/contexts/MiningContext';
import { useAuth } from '@/contexts/AuthContext';
import PaymentModal from '@/components/PaymentModal';

interface DMIBoosterProps {
  dmiBoosters?: DMIBoosterType[];
}

const DMIBooster: React.FC<DMIBoosterProps> = ({ dmiBoosters: propsBoosters }) => {
  const { toast } = useToast();
  const [selectedBoost, setSelectedBoost] = useState<DMIBoosterType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { updateMiningBoost } = useMining();
  const { user, updateUser } = useAuth();
  
  // Use the boosters from props or fallback to the default ones
  const boostersToUse = propsBoosters || dmiBoosters;
  
  const handlePurchase = (boost: DMIBoosterType) => {
    if (isProcessing) return;
    setSelectedBoost(boost);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async (transactionId: string) => {
    if (!selectedBoost || !user || isProcessing) return;
    
    setIsProcessing(true);
    setShowPaymentModal(false);
    
    try {
      console.log(`Processing payment completion for DMI Booster: ${selectedBoost.id}, transaction: ${transactionId}`);
      
      // Convert hours to days for the API
      const durationDays = selectedBoost.durationHours / 24;
      
      // Pass relevant parameters (miningBoost, durationDays, planId, dailyEarnings, planPrice)
      const activePlan = await updateMiningBoost(
        selectedBoost.miningMultiplier, 
        durationDays, 
        selectedBoost.id,
        0,  // DMI boosters don't have daily earnings as they're not arbitrage plans
        selectedBoost.price
      );
      
      if (activePlan) {
        toast({
          title: "Booster Activated!",
          description: `Your ${selectedBoost.name} has been successfully activated and will last for ${selectedBoost.durationHours} hours.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to activate booster. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error activating booster:", error);
      toast({
        title: "Error",
        description: "Failed to activate booster. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setSelectedBoost(null);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center mt-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-4">DMI Boosters</h2>
      <p className="text-md text-gray-500 text-center mb-6">
        Supercharge your mining speed with our limited-time DMI Boosters!
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {boostersToUse.map((booster) => (
          <Card
            key={booster.id}
            className={`border-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out ${selectedBoost?.id === booster.id ? 'border-blue-500' : 'border-gray-200'}`}
            onClick={() => setSelectedBoost(booster)}
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{booster.name}</CardTitle>
              <CardDescription className="text-gray-500">{booster.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Mining Multiplier:</span>
                <Badge className="bg-blue-100 text-blue-800 font-semibold">{booster.miningMultiplier}x</Badge>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Duration:</span>
                <Badge className="bg-green-100 text-green-800 font-semibold">{booster.durationHours} Hours</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Price:</span>
                <span className="font-bold">${booster.price}</span>
              </div>
              
              <Button 
                className="mt-4 w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePurchase(booster);
                }}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Purchase Now'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {showPaymentModal && selectedBoost && (
        <PaymentModal
          planId={selectedBoost.id}
          planName={selectedBoost.name}
          planPrice={selectedBoost.price}
          onClose={() => setShowPaymentModal(false)}
          onComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default DMIBooster;
