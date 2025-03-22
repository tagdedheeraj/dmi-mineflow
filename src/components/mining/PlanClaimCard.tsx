
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Clock, Zap } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivePlan } from '@/lib/storage';
import { MiningPlan } from '@/data/miningPlans';

interface PlanClaimCardProps {
  plan: ActivePlan;
  planInfo: MiningPlan;
  nextClaimTime: Date | null;
  onClaim: (planId: string) => void;
  isClaimLoading: boolean;
}

const PlanClaimCard: React.FC<PlanClaimCardProps> = ({
  plan,
  planInfo,
  nextClaimTime,
  onClaim,
  isClaimLoading
}) => {
  const now = new Date();
  const isExpired = now >= new Date(plan.expiresAt);
  const canClaim = !nextClaimTime || now >= nextClaimTime;
  const expiresIn = formatDistance(new Date(plan.expiresAt), now, { addSuffix: true });
  
  // Calculate time until next claim
  const timeUntilClaim = nextClaimTime 
    ? formatDistance(nextClaimTime, now, { addSuffix: false })
    : null;

  return (
    <Card className={`border ${isExpired ? 'border-gray-200 bg-gray-50' : canClaim ? 'border-green-300 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium">{planInfo.name}</CardTitle>
          <div className={`px-2 py-1 rounded text-xs font-medium ${isExpired ? 'bg-gray-200 text-gray-700' : 'bg-green-200 text-green-800'}`}>
            {isExpired ? 'Expired' : `$${planInfo.dailyEarnings}/day`}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {isExpired ? 'Plan has expired' : `Expires ${expiresIn}`}
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Zap className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-sm">{planInfo.miningBoost}x boost</span>
          </div>
          
          {isExpired ? (
            <div className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
              No longer active
            </div>
          ) : canClaim ? (
            <Button 
              size="sm" 
              className="text-xs"
              onClick={() => onClaim(plan.id)}
              disabled={isClaimLoading}
            >
              {isClaimLoading ? 'Processing...' : `Claim $${planInfo.dailyEarnings}`}
            </Button>
          ) : (
            <div className="flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              <Clock className="h-3 w-3 mr-1" />
              <span>Next claim in {timeUntilClaim}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanClaimCard;
