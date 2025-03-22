
import React from 'react';
import { MiningPlan } from '@/data/miningPlans';
import { ActivePlan } from '@/lib/storage';
import MiningPlanItem from './MiningPlanItem';

interface PlansListProps {
  availablePlans: MiningPlan[];
  activePlans: ActivePlan[];
  isProcessing: boolean;
  onPurchase: (plan: MiningPlan) => void;
}

const PlansList: React.FC<PlansListProps> = ({
  availablePlans,
  activePlans,
  isProcessing,
  onPurchase
}) => {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4">
      {availablePlans.map((plan) => {
        const isActive = activePlans.some(p => p.id === plan.id && new Date() < new Date(p.expiresAt));
        
        return (
          <MiningPlanItem
            key={plan.id}
            plan={plan}
            isActive={isActive}
            isProcessing={isProcessing}
            onPurchase={onPurchase}
          />
        );
      })}
    </div>
  );
};

export default PlansList;
