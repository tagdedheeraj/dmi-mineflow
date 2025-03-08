
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';
import { MiningPlan } from '@/data/miningPlans';
import { ActivePlan } from '@/lib/storage';

interface PlanCardProps {
  plan: MiningPlan;
  isActive: boolean;
  onPurchase: (plan: MiningPlan) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, isActive, onPurchase }) => {
  return (
    <div className={`border rounded-lg p-4 transition-all hover:shadow-md ${isActive ? 'border-green-300 bg-green-50' : 'border-gray-100'}`}>
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
        onClick={() => onPurchase(plan)}
      >
        <span>{isActive ? 'Purchase Again' : 'Purchase Now'}</span>
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PlanCard;
