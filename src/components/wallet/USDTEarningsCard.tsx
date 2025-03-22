
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign, Clock, CalendarDays, Upload, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { setUsdtAddress } from '@/lib/firestore';

interface USDTEarningsCardProps {
  userId: string;
  usdtEarnings: number;
  usdtAddress: string;
  dailyEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
  onAddressUpdate: (user: any) => void;
  onWithdraw: () => void;
}

const USDTEarningsCard: React.FC<USDTEarningsCardProps> = ({
  userId,
  usdtEarnings,
  usdtAddress,
  dailyEarnings,
  weeklyEarnings,
  monthlyEarnings,
  isRefreshing,
  onRefresh,
  onAddressUpdate,
  onWithdraw
}) => {
  const { toast } = useToast();
  const [isSettingAddress, setIsSettingAddress] = useState(false);
  const [newUsdtAddress, setNewUsdtAddress] = useState(usdtAddress || '');

  const handleSetUsdtAddress = async () => {
    if (newUsdtAddress.trim().length < 10) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid USDT BEP20 address",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedUser = await setUsdtAddress(userId, newUsdtAddress);
      if (updatedUser) {
        onAddressUpdate(updatedUser);
        setIsSettingAddress(false);
        toast({
          title: "Address Saved",
          description: "Your USDT withdrawal address has been saved successfully.",
        });
      }
    } catch (error) {
      console.error("Error setting USDT address:", error);
      toast({
        title: "Error",
        description: "Failed to save USDT address. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleWithdraw = () => {
    if (!usdtAddress) {
      setIsSettingAddress(true);
      return;
    }

    if (usdtEarnings < 50) {
      toast({
        title: "Minimum Withdrawal",
        description: "Minimum withdrawal amount is $50 USDT",
        variant: "destructive",
      });
      return;
    }

    onWithdraw();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="border-b border-gray-100 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center mr-4">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">USDT Earnings</h2>
              <p className="text-sm text-gray-500">From premium mining plans</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            ID: {userId?.substring(0, 8)}
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <div className="mb-5 bg-green-50 rounded-lg p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(usdtEarnings)}</p>
          <p className="text-gray-600 mt-1">Available for withdrawal</p>
          <div className="flex items-center justify-center mt-2">
            <p className="text-xs text-gray-500">
              Last refreshed: {new Date().toLocaleTimeString()}
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onRefresh}
              disabled={isRefreshing}
              className="ml-2 h-6 px-2"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center text-gray-500 mb-1">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Daily</span>
            </div>
            <p className="text-base font-semibold">{formatCurrency(dailyEarnings)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center text-gray-500 mb-1">
              <CalendarDays className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Weekly</span>
            </div>
            <p className="text-base font-semibold">{formatCurrency(weeklyEarnings)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center text-gray-500 mb-1">
              <CalendarDays className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Monthly</span>
            </div>
            <p className="text-base font-semibold">{formatCurrency(monthlyEarnings)}</p>
          </div>
        </div>
        
        {isSettingAddress ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Set your USDT BEP20 address for withdrawals:</p>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter USDT BEP20 address"
              value={newUsdtAddress}
              onChange={(e) => setNewUsdtAddress(e.target.value)}
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

export default USDTEarningsCard;
