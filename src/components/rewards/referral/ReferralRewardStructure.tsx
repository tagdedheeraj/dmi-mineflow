
import React from 'react';
import { Layers } from 'lucide-react';
import {
  REFERRAL_COMMISSION_RATE_LEVEL1,
  REFERRAL_COMMISSION_RATE_LEVEL1_PREMIUM,
  REFERRAL_COMMISSION_RATE_LEVEL2,
  REFERRAL_COMMISSION_RATE_LEVEL3,
  REFERRAL_COMMISSION_RATE_LEVEL4,
  REFERRAL_COMMISSION_RATE_LEVEL5,
  REFERRAL_REWARD_COINS_LEVEL1,
  REFERRAL_REWARD_COINS_LEVEL1_PREMIUM,
  REFERRAL_REWARD_COINS_LEVEL2,
  REFERRAL_REWARD_COINS_LEVEL2_PREMIUM,
  REFERRAL_REWARD_COINS_LEVEL3,
  REFERRAL_REWARD_COINS_LEVEL3_PREMIUM,
  REFERRAL_REWARD_COINS_LEVEL4,
  REFERRAL_REWARD_COINS_LEVEL4_PREMIUM,
  REFERRAL_REWARD_COINS_LEVEL5,
  REFERRAL_REWARD_COINS_LEVEL5_PREMIUM
} from '@/lib/rewards/referralCommissions';

interface ReferralRewardStructureProps {
  isPremium: boolean;
}

const ReferralRewardStructure: React.FC<ReferralRewardStructureProps> = ({ isPremium }) => {
  const getRewardText = (level: number) => {
    if (level === 1) {
      return `${isPremium ? REFERRAL_REWARD_COINS_LEVEL1_PREMIUM : REFERRAL_REWARD_COINS_LEVEL1} DMI Coins + ${(isPremium ? REFERRAL_COMMISSION_RATE_LEVEL1_PREMIUM : REFERRAL_COMMISSION_RATE_LEVEL1) * 100}% Commission`;
    } else if (level === 2) {
      return `${isPremium ? REFERRAL_REWARD_COINS_LEVEL2_PREMIUM : REFERRAL_REWARD_COINS_LEVEL2} DMI Coins + ${REFERRAL_COMMISSION_RATE_LEVEL2 * 100}% Commission`;
    } else if (level === 3) {
      return `${isPremium ? REFERRAL_REWARD_COINS_LEVEL3_PREMIUM : REFERRAL_REWARD_COINS_LEVEL3} DMI Coins + ${REFERRAL_COMMISSION_RATE_LEVEL3 * 100}% Commission`;
    } else if (level === 4) {
      return `${isPremium ? REFERRAL_REWARD_COINS_LEVEL4_PREMIUM : REFERRAL_REWARD_COINS_LEVEL4} DMI Coins + ${REFERRAL_COMMISSION_RATE_LEVEL4 * 100}% Commission`;
    } else if (level === 5) {
      return `${isPremium ? REFERRAL_REWARD_COINS_LEVEL5_PREMIUM : REFERRAL_REWARD_COINS_LEVEL5} DMI Coins + ${REFERRAL_COMMISSION_RATE_LEVEL5 * 100}% Commission`;
    }
    return "";
  };

  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg mb-4">
      <h3 className="font-medium flex items-center text-dmi">
        <Layers className="h-4 w-4 mr-2" />
        Your Reward Structure
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-blue-50 p-2 rounded-lg">
          <p className="text-xs font-semibold text-blue-700">Level 1</p>
          <p className="text-xs text-blue-600">{getRewardText(1)}</p>
        </div>
        
        <div className="bg-green-50 p-2 rounded-lg">
          <p className="text-xs font-semibold text-green-700">Level 2</p>
          <p className="text-xs text-green-600">{getRewardText(2)}</p>
        </div>
        
        <div className="bg-purple-50 p-2 rounded-lg">
          <p className="text-xs font-semibold text-purple-700">Level 3</p>
          <p className="text-xs text-purple-600">{getRewardText(3)}</p>
        </div>
        
        <div className="bg-orange-50 p-2 rounded-lg">
          <p className="text-xs font-semibold text-orange-700">Level 4</p>
          <p className="text-xs text-orange-600">{getRewardText(4)}</p>
        </div>
        
        <div className="bg-indigo-50 p-2 rounded-lg md:col-span-2">
          <p className="text-xs font-semibold text-indigo-700">Level 5</p>
          <p className="text-xs text-indigo-600">{getRewardText(5)}</p>
        </div>
      </div>
    </div>
  );
};

export default ReferralRewardStructure;
