
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Check, Lock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface StakingStatsProps {
  totalStaked: number;
  totalEarned: number;
  isStakingLocked: boolean;
  handleWithdrawStaking: () => void;
}

const StakingStats: React.FC<StakingStatsProps> = ({
  totalStaked,
  totalEarned,
  isStakingLocked,
  handleWithdrawStaking
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <h3 className="font-medium mb-3">Your Staking Stats</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Staked:</span>
          <span className="font-medium">{formatCurrency(totalStaked)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total Earned:</span>
          <span className="font-medium text-green-600">{formatCurrency(totalEarned)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Daily Rate:</span>
          <span className="font-medium">1%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Lock Status:</span>
          <span className={`font-medium flex items-center ${isStakingLocked ? 'text-red-500' : 'text-green-500'}`}>
            {isStakingLocked ? (
              <>
                <Lock className="h-4 w-4 mr-1" /> Locked until Aug 25
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-1" /> Unlocked
              </>
            )}
          </span>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        className="w-full mt-4 flex items-center justify-center"
        onClick={handleWithdrawStaking}
        disabled={totalStaked <= 0}
      >
        Withdraw Staked USDT <ArrowUpRight className="ml-1 h-4 w-4" />
        {isStakingLocked && <Lock className="ml-1 h-3 w-3 text-red-500" />}
      </Button>
    </div>
  );
};

export default StakingStats;
