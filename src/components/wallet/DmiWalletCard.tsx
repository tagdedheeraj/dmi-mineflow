
import React from 'react';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { WalletIcon, Clock, CalendarDays, Lock } from 'lucide-react';
import { DMI_COIN_VALUE } from '@/data/miningPlans';

interface DmiWalletCardProps {
  userBalance: number;
  dailyDmiEarnings: number;
  weeklyDmiEarnings: number;
  monthlyDmiEarnings: number;
}

const DmiWalletCard: React.FC<DmiWalletCardProps> = ({
  userBalance,
  dailyDmiEarnings,
  weeklyDmiEarnings,
  monthlyDmiEarnings
}) => {
  const dmiBalanceValue = userBalance * DMI_COIN_VALUE;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="border-b border-gray-100 p-5">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-dmi/10 flex items-center justify-center mr-4">
            <WalletIcon className="h-5 w-5 text-dmi" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">DMI Balance</h2>
            <p className="text-sm text-gray-500">Current mining rewards</p>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <div className="mb-5 bg-dmi/5 rounded-lg p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">{formatNumber(userBalance)} DMI</p>
          <p className="text-gray-600 mt-1">≈ {formatCurrency(dmiBalanceValue)}</p>
          <div className="mt-2 text-xs text-gray-500">1 DMI = {formatCurrency(DMI_COIN_VALUE)}</div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center text-gray-500 mb-1">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Daily</span>
            </div>
            <p className="text-base font-semibold">{formatNumber(dailyDmiEarnings.toFixed(1))}</p>
            <p className="text-xs text-gray-500">DMI</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center text-gray-500 mb-1">
              <CalendarDays className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Weekly</span>
            </div>
            <p className="text-base font-semibold">{formatNumber(weeklyDmiEarnings.toFixed(1))}</p>
            <p className="text-xs text-gray-500">DMI</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center text-gray-500 mb-1">
              <CalendarDays className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Monthly</span>
            </div>
            <p className="text-base font-semibold">{formatNumber(monthlyDmiEarnings.toFixed(1))}</p>
            <p className="text-xs text-gray-500">DMI</p>
          </div>
        </div>
        
        <Button className="w-full flex items-center justify-center" disabled>
          <Lock className="mr-2 h-4 w-4" />
          <span>Withdraw (Locked until mainnet)</span>
        </Button>
      </div>
    </div>
  );
};

export default DmiWalletCard;
