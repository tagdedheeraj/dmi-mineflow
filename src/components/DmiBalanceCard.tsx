
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMining } from '@/contexts/MiningContext';
import { Coins } from 'lucide-react';
import { DMI_COIN_VALUE } from '@/data/miningPlans';
import { formatNumber } from '@/lib/utils';

const DmiBalanceCard: React.FC = () => {
  const { user } = useAuth();
  const { miningRate } = useMining();
  
  // Calculate earnings based on current mining rate
  const dailyEarnings = miningRate * 24;
  const weeklyEarnings = dailyEarnings * 7;
  const monthlyEarnings = dailyEarnings * 30;
  
  // Calculate USD value
  const totalValueUsd = (user?.balance || 0) * DMI_COIN_VALUE;
  
  // For debugging purpose
  console.log(`[DmiBalanceCard] Current user balance: ${user?.balance} DMI - This is the actual value from Firestore, not modified`);

  return (
    <div className="w-full rounded-xl overflow-hidden bg-white shadow-md border border-gray-100 card-hover-effect animate-fade-in mt-6">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">DMI Coin Balance</h3>
            <p className="text-sm text-gray-500 mt-1">
              Track your mined DMI coins and their current value
            </p>
          </div>
          <div className="bg-dmi/10 text-dmi p-2 rounded-lg">
            <Coins className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-6 bg-dmi/5 rounded-lg p-6 text-center">
          <p className="text-3xl font-bold text-gray-900">{formatNumber(user?.balance || 0)} DMI</p>
          <p className="text-gray-600 mt-1">${formatNumber(totalValueUsd.toFixed(2))} USD</p>
          <div className="mt-2 text-xs text-gray-500">1 DMI = ${DMI_COIN_VALUE} USDT</div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Current Mining Rate: {miningRate} DMI/hr</p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Daily</p>
            <p className="text-lg font-semibold mt-1">{formatNumber(dailyEarnings.toFixed(1))}</p>
            <p className="text-xs text-gray-500">DMI</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Weekly</p>
            <p className="text-lg font-semibold mt-1">{formatNumber(weeklyEarnings.toFixed(1))}</p>
            <p className="text-xs text-gray-500">DMI</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Monthly</p>
            <p className="text-lg font-semibold mt-1">{formatNumber(monthlyEarnings.toFixed(1))}</p>
            <p className="text-xs text-gray-500">DMI</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DmiBalanceCard;
