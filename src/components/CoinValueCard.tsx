
import React from 'react';
import { Coins } from 'lucide-react';
import { DMI_COIN_VALUE } from '@/data/miningPlans';
import { formatNumber } from '@/lib/utils';

const CoinValueCard: React.FC = () => {
  return (
    <div className="w-full rounded-xl overflow-hidden bg-white shadow-md border border-gray-100 card-hover-effect animate-fade-in">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">DMI Coin Value</h3>
            <p className="text-sm text-gray-500 mt-1">
              Current value of DMI coin in the market
            </p>
          </div>
          <div className="bg-yellow-500/10 text-yellow-600 p-2 rounded-lg">
            <Coins className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-6 bg-yellow-500/5 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-yellow-500/10 p-2 rounded-full">
              <Coins className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">1 DMI = ${DMI_COIN_VALUE}</p>
          </div>
          <p className="text-gray-500 mt-2 text-sm">Reference value for all calculations</p>
        </div>
      </div>
    </div>
  );
};

export default CoinValueCard;
