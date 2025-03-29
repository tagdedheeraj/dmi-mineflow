
import React, { useEffect, useState } from 'react';
import { Coins, RefreshCw } from 'lucide-react';
import { DMI_COIN_VALUE, getCurrentDmiCoinValue } from '@/data/miningPlans';
import { formatNumber } from '@/lib/utils';

const CoinValueCard: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [coinValue, setCoinValue] = useState(DMI_COIN_VALUE);

  const refreshCoinValue = async () => {
    setIsRefreshing(true);
    try {
      const updatedValue = await getCurrentDmiCoinValue();
      setCoinValue(updatedValue);
    } catch (error) {
      console.error("Error refreshing DMI coin value:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial fetch of coin value
    refreshCoinValue();
  }, []);

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
          <div className="flex items-center gap-2">
            <button 
              onClick={refreshCoinValue} 
              disabled={isRefreshing}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="bg-yellow-500/10 text-yellow-600 p-2 rounded-lg">
              <Coins className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="mt-6 bg-yellow-500/5 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-yellow-500/10 p-2 rounded-full">
              <Coins className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">1 DMI = ${coinValue.toFixed(4)}</p>
          </div>
          <p className="text-gray-500 mt-2 text-sm">Reference value for all calculations</p>
        </div>
      </div>
    </div>
  );
};

export default CoinValueCard;
