
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge, Copy, Gift, Layers, Share2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PremiumStatusBadge from './PremiumStatusBadge';
import ReferralRewardStructure from './ReferralRewardStructure';

interface ReferralOverviewProps {
  isPremium: boolean;
  referralCode: string;
  referralStats: any;
  totalCommission: number;
  inputCode: string;
  setInputCode: (code: string) => void;
  isSubmitting: boolean;
  referredUsers: any[];
  user: any;
  handleApplyCode: () => Promise<void>;
  refreshCommissionData: () => Promise<void>;
  copyReferralCode: () => void;
  shareReferralCode: () => void;
}

const ReferralOverview: React.FC<ReferralOverviewProps> = ({
  isPremium,
  referralCode,
  referralStats,
  totalCommission,
  inputCode,
  setInputCode,
  isSubmitting,
  referredUsers,
  user,
  handleApplyCode,
  refreshCommissionData,
  copyReferralCode,
  shareReferralCode
}) => {
  return (
    <div className="space-y-4">
      <PremiumStatusBadge isPremium={isPremium} />
    
      <p className="text-sm text-gray-600 mb-4">
        Share your referral code and earn rewards across 5 levels! Each person who joins using your code earns you DMI coins and commission on their arbitrage plans. 
        Your rewards increase when you purchase a $100+ plan!
      </p>
      
      <ReferralRewardStructure isPremium={isPremium} />
      
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
          <Badge className="h-5 w-5 text-yellow-600" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500">Commission Earnings</p>
          <p className="font-semibold text-lg">{totalCommission.toFixed(2)} USDT</p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-blue-500 p-0 h-auto" 
            onClick={refreshCommissionData}
          >
            Refresh
          </Button>
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

export default ReferralOverview;
