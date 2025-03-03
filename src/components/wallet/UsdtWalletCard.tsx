
import React, { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, Clock, CalendarDays, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';
import { setUsdtAddress, createWithdrawalRequest } from '@/lib/storage';

interface UsdtWalletCardProps {
  user: User;
  usdtEarnings: number;
  dailyUsdtEarnings: number;
  weeklyUsdtEarnings: number;
  monthlyUsdtEarnings: number;
  updateUser: (user: User) => void;
  refreshWithdrawalHistory: () => void;
}

const UsdtWalletCard: React.FC<UsdtWalletCardProps> = ({
  user,
  usdtEarnings,
  dailyUsdtEarnings,
  weeklyUsdtEarnings,
  monthlyUsdtEarnings,
  updateUser,
  refreshWithdrawalHistory
}) => {
  const { toast } = useToast();
  const [usdtAddress, setUsdtAddressState] = useState(user?.usdtAddress || '');
  const [isSettingAddress, setIsSettingAddress] = useState(false);

  const handleSetUsdtAddress = () => {
    if (usdtAddress.trim().length < 10) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid USDT BEP20 address",
        variant: "destructive",
      });
      return;
    }

    const updatedUser = setUsdtAddress(usdtAddress);
    if (updatedUser) {
      updateUser(updatedUser);
      setIsSettingAddress(false);
      toast({
        title: "Address Saved",
        description: "Your USDT withdrawal address has been saved successfully.",
      });
    }
  };

  const handleWithdraw = () => {
    if (!user.usdtAddress) {
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

    // Create a withdrawal request
    createWithdrawalRequest(user.id, usdtEarnings, user.usdtAddress);
    
    // Update the user in context
    updateUser({...user, usdtEarnings: 0});
    
    // Refresh withdrawal history
    refreshWithdrawalHistory();
    
    toast({
      title: "Withdrawal Requested",
      description: "Your withdrawal request has been submitted and will be processed by admin.",
    });
  };

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
            <Input
              type="text"
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

export default UsdtWalletCard;
