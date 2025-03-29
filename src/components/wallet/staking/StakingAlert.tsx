
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const StakingAlert: React.FC = () => {
  return (
    <Alert className="mb-5 bg-yellow-50 border-yellow-200">
      <Info className="h-4 w-4 text-yellow-600 mr-2" />
      <AlertDescription className="text-yellow-800">
        <p className="font-medium text-amber-700 text-base">Airdrop Withdrawal Eligibility:</p>
        <ul className="mt-1 text-sm list-disc pl-5 space-y-1">
          <li>Users who stake <span className="font-bold text-green-600">$250+</span> or purchase a <span className="font-bold text-green-600">$500 arbitrage plan</span> can withdraw <span className="font-bold text-green-600">50% of their airdrop coins</span>.</li>
          <li>Users without staking will <span className="font-bold text-red-600">not be able to withdraw</span> and will <span className="font-bold text-red-600">lose their airdrop coins</span> after April 10.</li>
          <li>Withdrawals will be available after <span className="font-bold text-amber-700">April 10, 2025</span>.</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
};

export default StakingAlert;
