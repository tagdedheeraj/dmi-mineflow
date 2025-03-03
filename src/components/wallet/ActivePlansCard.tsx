
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { miningPlans } from '@/data/miningPlans';

interface ActivePlan {
  id: string;
  boostMultiplier: number;
  purchasedAt: number;
  expiresAt: number;
}

interface ActivePlansCardProps {
  activePlans: ActivePlan[];
}

const ActivePlansCard: React.FC<ActivePlansCardProps> = ({ activePlans }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="border-b border-gray-100 p-5">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-4">
            <CreditCard className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Active Plans</h2>
            <p className="text-sm text-gray-500">Your premium mining subscriptions</p>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        {activePlans.length > 0 ? (
          <div className="space-y-4">
            {activePlans.map(plan => {
              const planInfo = miningPlans.find(p => p.id === plan.id);
              return (
                <div key={plan.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{planInfo?.name || plan.id.charAt(0).toUpperCase() + plan.id.slice(1)} Plan</h3>
                    <span className="text-green-600 text-sm font-medium">{plan.boostMultiplier}x Boost</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>Purchased: {new Date(plan.purchasedAt).toLocaleDateString()}</div>
                    <div>Expires: {new Date(plan.expiresAt).toLocaleDateString()}</div>
                    {planInfo && (
                      <div className="col-span-2 mt-1">
                        <span className="text-green-600 font-medium">+{formatCurrency(planInfo.dailyEarnings)}</span> daily earnings
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">You don't have any active plans</p>
            <Button 
              className="mt-4"
              onClick={() => navigate('/plans')}
            >
              View Available Plans
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivePlansCard;
