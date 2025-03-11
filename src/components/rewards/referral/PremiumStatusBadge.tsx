
import React from 'react';
import { Badge } from 'lucide-react';
import { PREMIUM_PLAN_THRESHOLD } from '@/lib/rewards/referralCommissions';

interface PremiumStatusBadgeProps {
  isPremium: boolean;
}

const PremiumStatusBadge: React.FC<PremiumStatusBadgeProps> = ({ isPremium }) => {
  if (isPremium) {
    return (
      <div className="bg-gradient-to-r from-amber-100 to-amber-200 p-3 rounded-lg flex items-center space-x-3 mb-4">
        <div className="bg-amber-400 p-2 rounded-full">
          <Badge className="h-5 w-5 text-amber-800" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-amber-800">Premium Referral Status Active</p>
          <p className="text-xs text-amber-700">
            You've unlocked premium referral rewards by purchasing a plan worth ${PREMIUM_PLAN_THRESHOLD}+
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 p-3 rounded-lg mb-4">
      <p className="text-sm text-gray-600">
        <Badge className="h-4 w-4 text-gray-500 inline mr-2" />
        Upgrade to premium rewards by purchasing any plan worth ${PREMIUM_PLAN_THRESHOLD}+ to earn higher referral bonuses on all 5 levels!
      </p>
    </div>
  );
};

export default PremiumStatusBadge;
