
import React from 'react';
import { DollarSign, Clock, CalendarDays, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { User } from '@/lib/storage/types';

interface USDTEarningsSectionProps {
  user: User;
  dailyUsdtEarnings: number;
  weeklyUsdtEarnings: number;
  monthlyUsdtEarnings: number;
  isSettingAddress: boolean;
  usdtAddress: string;
  setUsdtAddressState: (address: string) => void;
  handleSetUsdtAddress: () => void;
  setIsSettingAddress: (setting: boolean) => void;
  handleWithdraw: () => void;
}

const USDTEarningsSection: React.FC<USDTEarningsSectionProps> = ({
  user,
  dailyUsdtEarnings,
  weeklyUsdtEarnings,
  monthlyUsdtEarnings,
  isSettingAddress,
  usdtAddress,
  setUsdtAddressState,
  handleSetUsdtAddress,
  setIsSettingAddress,
  handleWithdraw
}) => {
  const usdtEarnings = user?.usdtEarnings || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="border-b border-gray-100 p-5">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center mr-4">
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">USDT Earnings</h2>
            <p className="text-sm text-gray-500">From premium mining plans</p>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <div className="mb-5 bg-green-50 rounded-lg p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(usdtEarnings)}</p>
          <p className="text-gray-600 mt-1">Available for withdrawal</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center text-gray-500 mb-1">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Daily</span>
            </div>
            <p className="text-base font-semibold">{formatCurrency(dailyUsdtEarnings)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center text-gray-500 mb-1">
              <CalendarDays className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Weekly</span>
            </div>
            <p className="text-base font-semibold">{formatCurrency(weeklyUsdtEarnings)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center text-gray-500 mb-1">
              <CalendarDays className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Monthly</span>
            </div>
            <p className="text-base font-semibold">{formatCurrency(monthlyUsdtEarnings)}</p>
          </div>
        </div>
        
        {isSettingAddress ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Set your USDT BEP20 address for withdrawals:</p>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter USDT BEP20 address"
              value={usdtAddress}
              onChange={(e) => setUsdtAddressState(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline"
                onClick={() => setIsSettingAddress(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSetUsdtAddress}>
                Save Address
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            className="w-full flex items-center justify-center"
            onClick={handleWithdraw}
            disabled={usdtEarnings < 50}
          >
            <Upload className="mr-2 h-4 w-4" />
            <span>Withdraw USDT</span>
          </Button>
        )}
        
        {usdtEarnings < 50 && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Minimum withdrawal: $50 USDT
          </p>
        )}
      </div>
    </div>
  );
};

export default USDTEarningsSection;
