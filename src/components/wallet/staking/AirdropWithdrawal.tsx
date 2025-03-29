
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AirdropWithdrawalProps {
  canWithdrawAirdrop: boolean;
  withdrawableAmount: number;
  withdrawableUsdValue: number;
  handleWithdrawAirdrop: () => void;
}

const AirdropWithdrawal: React.FC<AirdropWithdrawalProps> = ({
  canWithdrawAirdrop,
  withdrawableAmount,
  withdrawableUsdValue,
  handleWithdrawAirdrop
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-start mb-3">
        <Wallet className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
        <div>
          <h3 className="font-medium">DMI Airdrop Withdrawal</h3>
          <p className="text-xs text-gray-600 mt-1">
            {canWithdrawAirdrop 
              ? <span className="font-medium text-green-600">You are eligible to withdraw 50% of your DMI coins</span> 
              : <span>Stake at least <span className="font-medium text-amber-600">$250</span> or purchase a <span className="font-medium text-amber-600">$500 plan</span> to withdraw 50% airdrop coins. <span className="font-medium text-red-600">Without staking, airdrop coins will be removed after April 10.</span></span>}
          </p>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Available for withdrawal:</span>
          <span className="font-medium text-green-600">
            {withdrawableAmount.toLocaleString()} DMI
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Estimated value:</span>
          <span className="font-medium">{formatCurrency(withdrawableUsdValue)}</span>
        </div>
        <div className="text-xs text-gray-500">
          50% withdrawals available after <span className="font-medium text-amber-600">April 10, 2025</span>
        </div>
      </div>
      
      <Button 
        variant="outline"
        className="w-full flex items-center justify-center"
        disabled={!canWithdrawAirdrop || withdrawableAmount <= 0}
        onClick={handleWithdrawAirdrop}
      >
        Withdraw Airdrop <ArrowUpRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
};

export default AirdropWithdrawal;
