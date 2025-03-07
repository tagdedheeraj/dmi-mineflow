
import React from 'react';
import { Badge, Coins, Copy, DollarSign, Gift, Layers, Share2, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PREMIUM_PLAN_THRESHOLD } from '@/lib/rewards/referralCommissions';

interface ReferralOverviewProps {
  isPremium: boolean;
  referralCode: string;
  referralStats: any;
  totalCommission: number;
  inputCode: string;
  setInputCode: (code: string) => void;
  user: any;
  isSubmitting: boolean;
  handleApplyCode: () => Promise<void>;
  copyReferralCode: () => void;
  shareReferralCode: () => void;
  getRewardText: (level: number) => string;
  referredUsers: any[];
}

const ReferralOverview: React.FC<ReferralOverviewProps> = ({
  isPremium,
  referralCode,
  referralStats,
  totalCommission,
  inputCode,
  setInputCode,
  user,
  isSubmitting,
  handleApplyCode,
  copyReferralCode,
  shareReferralCode,
  getRewardText,
  referredUsers
}) => {
  return (
    <div className="p-4 space-y-4">
      {/* Premium Status */}
      {isPremium ? (
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-3 rounded-lg flex items-center space-x-3 mb-4">
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
        <div className="bg-gray-50 p-3 rounded-lg mb-4 border border-gray-100">
          <p className="text-sm text-gray-600 flex items-center">
            <Badge className="h-4 w-4 text-gray-500 mr-2" />
            Upgrade to premium rewards by purchasing any plan worth ${PREMIUM_PLAN_THRESHOLD}+ to earn higher referral bonuses on all 5 levels!
          </p>
        </div>
      )}
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg flex items-center space-x-4 border border-blue-100 shadow-sm">
          <div className="bg-blue-50 p-3 rounded-full">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Referrals</p>
            <p className="font-semibold text-xl">{referralStats.totalReferrals}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg flex items-center space-x-4 border border-green-100 shadow-sm">
          <div className="bg-green-50 p-3 rounded-full">
            <Gift className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Earnings</p>
            <p className="font-semibold text-xl">{referralStats.totalEarnings} DMI</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg flex items-center space-x-4 border border-yellow-100 shadow-sm">
          <div className="bg-yellow-50 p-3 rounded-full">
            <DollarSign className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Commission Earnings</p>
            <p className="font-semibold text-xl">{totalCommission.toFixed(2)} USDT</p>
          </div>
        </div>
      </div>
      
      {/* Referral Code Section */}
      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm mb-4">
        <Label htmlFor="referral-code" className="text-sm font-medium mb-2 block text-gray-700">Your Referral Code</Label>
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
            <Copy className="h-4 w-4 mr-1" /> Copy
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={shareReferralCode} 
            className="ml-2 flex-shrink-0"
          >
            <Share2 className="h-4 w-4 mr-1" /> Share
          </Button>
        </div>
        
        {!user?.appliedReferralCode ? (
          <div className="mt-4">
            <Label htmlFor="apply-code" className="text-sm font-medium mb-2 block text-gray-700">Apply a Referral Code</Label>
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
        ) : (
          <div className="mt-3 text-sm text-gray-600 bg-green-50 p-3 rounded-md">
            <Gift className="h-4 w-4 text-green-500 inline mr-2" />
            You've already applied a referral code: <span className="font-medium">{user.appliedReferralCode}</span>
          </div>
        )}
      </div>
      
      {/* Reward Structure */}
      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
        <h3 className="font-medium flex items-center text-dmi mb-3">
          <Layers className="h-4 w-4 mr-2" />
          Your Reward Structure
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <div className="bg-blue-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-blue-700">1</div>
              <p className="ml-2 text-sm font-semibold text-blue-700">Level 1</p>
            </div>
            <p className="text-xs text-blue-600 pl-7">{getRewardText(1)}</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <div className="bg-green-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-green-700">2</div>
              <p className="ml-2 text-sm font-semibold text-green-700">Level 2</p>
            </div>
            <p className="text-xs text-green-600 pl-7">{getRewardText(2)}</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <div className="bg-purple-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-purple-700">3</div>
              <p className="ml-2 text-sm font-semibold text-purple-700">Level 3</p>
            </div>
            <p className="text-xs text-purple-600 pl-7">{getRewardText(3)}</p>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <div className="bg-orange-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-orange-700">4</div>
              <p className="ml-2 text-sm font-semibold text-orange-700">Level 4</p>
            </div>
            <p className="text-xs text-orange-600 pl-7">{getRewardText(4)}</p>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-3 rounded-lg md:col-span-2">
            <div className="flex items-center mb-1">
              <div className="bg-indigo-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-indigo-700">5</div>
              <p className="ml-2 text-sm font-semibold text-indigo-700">Level 5</p>
            </div>
            <p className="text-xs text-indigo-600 pl-7">{getRewardText(5)}</p>
          </div>
        </div>
      </div>
      
      {/* Direct Referrals */}
      {referredUsers.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <User className="h-4 w-4 mr-2" />
            Your Direct Referrals ({referredUsers.length})
          </h3>
          <div className="border rounded-md overflow-hidden">
            <div className="grid grid-cols-2 bg-gray-50 p-2 text-xs font-medium text-gray-700 border-b">
              <div>User</div>
              <div>Date Joined</div>
            </div>
            <div className="max-h-32 overflow-y-auto">
              {referredUsers.map(user => (
                <div key={user.id} className="grid grid-cols-2 p-2 text-xs border-b last:border-0">
                  <span className="font-medium">{user.fullName}</span>
                  <span className="text-gray-500">
                    {user.timestamp && new Date(user.timestamp.toDate()).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralOverview;
