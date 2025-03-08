import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, TrendingUp } from "lucide-react"
import { DMIBooster as DMIBoosterType } from '@/data/dmiBoosters';
import { useMining } from '@/contexts/MiningContext';
import { useAuth } from '@/contexts/AuthContext';

interface DMIBoosterProps {
  dmiBoosters: DMIBoosterType[];
}

const DMIBooster: React.FC<DMIBoosterProps> = ({ dmiBoosters }) => {
  const { toast } = useToast();
  const [selectedBoost, setSelectedBoost] = useState<DMIBoosterType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { updateMiningBoost } = useMining();
  const { user, updateUser } = useAuth();
  
  const handleBoostActivation = async () => {
    if (!selectedBoost || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Update to pass all required parameters (miningBoost, durationDays, planId, dailyEarnings, planPrice)
      // Since this is a DMI booster, we're using '0' for dailyEarnings and planPrice as they aren't relevant
      await updateMiningBoost(selectedBoost.miningMultiplier, selectedBoost.durationHours / 24, selectedBoost.id, 0, 0);
      
      toast({
        title: "Boost Activated!",
        description: `Your ${selectedBoost.name} has been successfully activated.`,
      });
      
      // Get updated user data after boost activation
      const updatedUser = await updateUser(user);
      
      if (!updatedUser) {
        toast({
          title: "Error",
          description: "Failed to update user data. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error activating boost:", error);
      toast({
        title: "Error",
        description: "Failed to activate boost. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center mt-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-4">DMI Boosters</h2>
      <p className="text-md text-gray-500 text-center mb-6">
        Supercharge your mining speed with our limited-time DMI Boosters!
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {dmiBoosters.map((booster) => (
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
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Button 
        className="mt-8 w-full max-w-md"
        onClick={handleBoostActivation}
        disabled={!selectedBoost || isProcessing}
      >
        {isProcessing ? 'Activating...' : `Activate ${selectedBoost?.name}`}
      </Button>
    </div>
  );
};

export default DMIBooster;
