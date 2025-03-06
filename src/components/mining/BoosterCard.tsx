
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BoosterCardProps {
  onBoosterPurchase: () => void;
  onViewMorePlans: () => void;
}

const BoosterCard: React.FC<BoosterCardProps> = ({ 
  onBoosterPurchase, 
  onViewMorePlans 
}) => {
  return (
    <Card className="overflow-hidden border border-gray-100 shadow-md animate-fade-in" id="dmi-boosters">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-medium text-gray-900">DMI Booster</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Supercharge your mining speed with special booster packs
            </CardDescription>
          </div>
          <div className="bg-yellow-500/10 text-yellow-600 p-2 rounded-lg">
            <Zap className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-2 border border-gray-100 rounded-lg p-4 transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-gray-900">Standard Booster</h4>
              <p className="text-sm text-gray-500 mt-1">30 days</p>
            </div>
            <div className="text-xl font-bold text-gray-900">$20</div>
          </div>
          
          <div className="mt-2">
            <div className="flex items-center text-sm">
              <Sparkles className="h-4 w-4 text-amber-500 mr-2" />
              <span>2x faster mining for 30 days</span>
            </div>
            <div className="bg-yellow-500/20 text-yellow-700 px-3 py-1 rounded-md font-semibold mt-2 inline-block">
              2x Mining Speed
            </div>
          </div>
          
          <Button 
            className="w-full mt-4 flex justify-center items-center space-x-2"
            onClick={onBoosterPurchase}
          >
            <span>Purchase Now</span>
          </Button>

          <Button 
            variant="outline" 
            className="w-full mt-2"
            onClick={onViewMorePlans}
          >
            View More Plans
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BoosterCard;
