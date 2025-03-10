
import React from 'react';
import { Badge, Copy, Gift, Layers, Users, Share2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  REFERRAL_REWARD_COINS_LEVEL1,
  REFERRAL_REWARD_COINS_LEVEL1_PREMIUM,
  REFERRAL_REWARD_COINS_LEVEL2,
  REFERRAL_REWARD_COINS_LEVEL2_PREMIUM,
  REFERRAL_REWARD_COINS_LEVEL3,
  REFERRAL_REWARD_COINS_LEVEL3_PREMIUM,
  REFERRAL_REWARD_COINS_LEVEL4,
  REFERRAL_REWARD_COINS_LEVEL4_PREMIUM,
  REFERRAL_REWARD_COINS_LEVEL5,
  REFERRAL_REWARD_COINS_LEVEL5_PREMIUM,
  REFERRAL_COMMISSION_RATE_LEVEL1,
  REFERRAL_COMMISSION_RATE_LEVEL1_PREMIUM,
  REFERRAL_COMMISSION_RATE_LEVEL2,
  REFERRAL_COMMISSION_RATE_LEVEL3,
  REFERRAL_COMMISSION_RATE_LEVEL4,
  REFERRAL_COMMISSION_RATE_LEVEL5,
  PREMIUM_PLAN_THRESHOLD
} from '@/lib/rewards/referralCommissions';
import { handleApplyReferralCode } from '../services/ReferralServices';

interface OverviewTabProps {
  user: any;
  referralCode: string;
  inputCode: string;
  setInputCode: (code: string) => void;
  referredUsers: any[];
  referralStats: any;
  totalCommission: number;
  isPremium: boolean;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  updateUser: (user: any) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  user,
  referralCode,
  inputCode,
  setInputCode,
  referredUsers,
  referralStats,
  totalCommission,
  isPremium,
  isSubmitting,
  setIsSubmitting,
  updateUser
}) => {
  const { toast } = useToast();

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard.",
    });
  };

  const shareReferralCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join DMI Network with my referral code',
          text: `Use my referral code ${referralCode} to join DMI Network and get 200 DMI coins bonus! Plus, I'll earn 5% of your plan earnings as commission!`,
          url: 'https://dminetwork.us'
        });
        toast({
          title: "Shared!",
          description: "Your referral code has been shared.",
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyReferralCode();
    }
  };
  
  const handleApplyCode = async () => {
    if (!inputCode) {
      toast({
        title: "Error",
        description: "Please enter a referral code.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await handleApplyReferralCode(user?.id || '', inputCode);
      
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        
        if (user) {
          updateUser({ ...user, appliedReferralCode: inputCode });
        }
        
        setInputCode('');
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply referral code. Please try again.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

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
    <div>
      {isPremium ? (
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
      ) : (
        <div className="bg-gray-100 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-600">
            <Badge className="h-4 w-4 text-gray-500 inline mr-2" />
            Upgrade to premium rewards by purchasing any plan worth ${PREMIUM_PLAN_THRESHOLD}+ to earn higher referral bonuses on all 5 levels!
          </p>
        </div>
      )}
    
      <p className="text-sm text-gray-600 mb-4">
        Share your referral code and earn rewards across 5 levels! Each person who joins using your code earns you DMI coins and commission on their arbitrage plans. 
        Your rewards increase when you purchase a ${PREMIUM_PLAN_THRESHOLD}+ plan!
      </p>
      
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Referrals</p>
            <p className="font-semibold text-lg">{referralStats.totalReferrals}</p>
          </div>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg flex items-center space-x-3">
          <div className="bg-green-100 p-2 rounded-full">
            <Gift className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Earnings</p>
            <p className="font-semibold text-lg">{referralStats.totalEarnings} DMI</p>
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-50 p-3 rounded-lg flex items-center space-x-3 mb-6">
        <div className="bg-yellow-100 p-2 rounded-full">
          <DollarSign className="h-5 w-5 text-yellow-600" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500">Commission Earnings</p>
          <p className="font-semibold text-lg">{totalCommission.toFixed(2)} USDT</p>
          <p className="text-xs text-gray-600">
            You earn commissions on all 5 levels of your referral network
          </p>
        </div>
      </div>
      
      <div className="mb-6">
        <Label htmlFor="referral-code" className="text-sm font-medium mb-1.5 block">Your Referral Code</Label>
        <div className="flex items-center">
          <Input 
            id="referral-code"
            value={referralCode} 
            readOnly 
            className="bg-gray-50 border-gray-200"
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyReferralCode} 
            className="ml-2 flex-shrink-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={shareReferralCode} 
            className="ml-2 flex-shrink-0"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {!user?.appliedReferralCode && (
        <div className="mb-4">
          <Label htmlFor="apply-code" className="text-sm font-medium mb-1.5 block">Apply a Referral Code</Label>
          <div className="flex items-center gap-2">
            <Input
              id="apply-code"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Enter friend's code"
              className="flex-1"
            />
            <Button 
              onClick={handleApplyCode} 
              disabled={isSubmitting}
              className="flex-shrink-0"
            >
              Apply
            </Button>
          </div>
        </div>
      )}
      
      {user?.appliedReferralCode && (
        <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-md mb-4">
          <Gift className="h-4 w-4 text-green-500 inline mr-2" />
          You've already applied a referral code: <span className="font-medium">{user.appliedReferralCode}</span>
        </div>
      )}
      
      {referredUsers.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Your Direct Referrals ({referredUsers.length})</h3>
          <div className="border rounded-md divide-y divide-gray-100 max-h-32 overflow-y-auto">
            {referredUsers.map(user => (
              <div key={user.id} className="p-2 text-xs flex justify-between items-center">
                <span className="font-medium">{user.fullName}</span>
                <span className="text-gray-500">
                  {user.timestamp && new Date(user.timestamp.toDate()).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
