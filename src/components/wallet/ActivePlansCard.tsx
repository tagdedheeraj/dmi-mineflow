
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CreditCard, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ActivePlan } from '@/lib/storage';
import { miningPlans } from '@/data/miningPlans';

interface ActivePlansCardProps {
  activePlans: ActivePlan[];
  planDaysRemaining: Record<string, number>;
  claimableStatus: Record<string, {
    canClaim: boolean;
    nextClaimTime: Date | null;
    isLoading: boolean;
    dailyEarnings: number;
  }>;
  isClaimingPlan: string | null;
  onClaimEarnings: (planId: string) => Promise<void>;
}

const ActivePlansCard: React.FC<ActivePlansCardProps> = ({
  activePlans,
  planDaysRemaining,
  claimableStatus,
  isClaimingPlan,
  onClaimEarnings
}) => {
  const formatClaimTime = (date: Date | null) => {
    if (!date) return "Unknown";
    
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff <= 0) return "Available now";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `Available in ${hours}h ${minutes}m`;
    } else {
      return `Available in ${minutes}m`;
    }
  };

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
            {activePlans.filter(plan => new Date() < new Date(plan.expiresAt)).map(plan => {
              const planInfo = miningPlans.find(p => p.id === plan.id);
              const daysRemaining = planDaysRemaining[plan.id] || 0;
              const totalDays = planInfo?.duration || 30;
              const progressPercent = Math.max(0, Math.min(100, (daysRemaining / totalDays) * 100));
              const claimStatus = claimableStatus[plan.id] || { 
                canClaim: false, 
                nextClaimTime: null, 
                isLoading: true,
                dailyEarnings: 0
              };
              
              return (
                <div key={plan.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{plan.name || planInfo?.name || "Mining Plan"}</h3>
                    <span className="text-green-600 text-sm font-medium">{plan.boostMultiplier}x Boost</span>
                  </div>
                  
                  <div className="mt-3 mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{daysRemaining} days remaining</span>
                      <span className="text-gray-600">{totalDays} days total</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>Purchased: {new Date(plan.purchasedAt).toLocaleDateString()}</div>
                    <div>Expires: {new Date(plan.expiresAt).toLocaleDateString()}</div>
                    {planInfo && (
                      <div className="col-span-2 mt-1">
                        <span className="text-green-600 font-medium">+{formatCurrency(planInfo.dailyEarnings)}</span> daily earnings
                      </div>
                    )}
                    {plan.planCost > 0 && (
                      <div className="col-span-2 mt-1">
                        Plan cost: <span className="text-gray-800 font-medium">{formatCurrency(plan.planCost)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    {claimStatus.isLoading ? (
                      <Button className="w-full" disabled>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Checking...
                      </Button>
                    ) : claimStatus.canClaim ? (
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => onClaimEarnings(plan.id)}
                        disabled={isClaimingPlan !== null}
                      >
                        {isClaimingPlan === plan.id ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Claiming...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Claim {formatCurrency(claimStatus.dailyEarnings)} USDT
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button className="w-full" disabled>
                        <Clock className="h-4 w-4 mr-2" />
                        {formatClaimTime(claimStatus.nextClaimTime)}
                      </Button>
                    )}
                  </div>
                  
                  <div className="mt-3 bg-blue-50 p-2 rounded flex items-center text-sm text-blue-700">
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>
                      {daysRemaining <= 0 
                        ? "Plan has expired" 
                        : daysRemaining === 1 
                          ? "Plan expires tomorrow" 
                          : `Plan expires in ${daysRemaining} days`}
                    </span>
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
              onClick={() => window.location.href = '/plans'}
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
