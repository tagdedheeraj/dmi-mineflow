
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMining } from '@/contexts/MiningContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Wallet as WalletIcon, 
  DollarSign, 
  Clock, 
  CalendarDays,
  Upload,
  Zap,
  CreditCard,
  Lock,
  History
} from 'lucide-react';
import { DMI_COIN_VALUE, miningPlans } from '@/data/miningPlans';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { setUsdtAddress, updateUsdtEarnings, createWithdrawalRequest } from '@/lib/storage';

const Wallet: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { activePlans, miningRate } = useMining();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [usdtAddress, setUsdtAddressState] = useState(user?.usdtAddress || '');
  const [isSettingAddress, setIsSettingAddress] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);

  const dailyDmiEarnings = miningRate * 24;
  const weeklyDmiEarnings = dailyDmiEarnings * 7;
  const monthlyDmiEarnings = dailyDmiEarnings * 30;
  
  const dmiBalanceValue = (user?.balance || 0) * DMI_COIN_VALUE;
  
  const usdtEarnings = user?.usdtEarnings || 0;
  
  const dailyUsdtEarnings = activePlans.reduce((total, plan) => {
    const planInfo = miningPlans.find(p => p.id === plan.id);
    return total + (planInfo?.dailyEarnings || 0);
  }, 0);
  
  const weeklyUsdtEarnings = dailyUsdtEarnings * 7;
  const monthlyUsdtEarnings = dailyUsdtEarnings * 30;

  useEffect(() => {
    // Load withdrawal history
    const withdrawalRequests = localStorage.getItem('withdrawal_requests');
    if (withdrawalRequests) {
      const requests = JSON.parse(withdrawalRequests);
      const userRequests = requests.filter((req: any) => req.userId === user?.id);
      setWithdrawalHistory(userRequests);
    }
  }, [user?.id]);

  if (!user) {
    navigate('/signin');
    return null;
  }

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
    
    // Update withdrawal history
    const withdrawalRequests = localStorage.getItem('withdrawal_requests');
    if (withdrawalRequests) {
      const requests = JSON.parse(withdrawalRequests);
      const userRequests = requests.filter((req: any) => req.userId === user.id);
      setWithdrawalHistory(userRequests);
    }
    
    toast({
      title: "Withdrawal Requested",
      description: "Your withdrawal request has been submitted and will be processed by admin.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-fade-in">
      <Header />
      
      <main className="pt-24 px-4 max-w-screen-md mx-auto">
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
              <p className="text-3xl font-bold text-gray-900">{formatNumber(user.balance)} DMI</p>
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
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-5">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center mr-4">
                <Zap className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">Mining Speed Boost</h2>
                <p className="text-sm text-gray-500">Boost your mining speed with premium plans or referrals!</p>
              </div>
            </div>
            
            <Button 
              className="w-full mt-4 flex items-center justify-center"
              onClick={() => navigate('/plans')}
            >
              <Zap className="mr-2 h-4 w-4" />
              <span>Boost Mining Speed</span>
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="border-b border-gray-100 p-5">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-4">
                <CreditCard className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">Active Plans</h2>
                <p className="text-sm text-gray-500">Your premium mining subscriptions</p>
              </div>
            </div>
          </div>
          
          <div className="p-5">
            {activePlans.length > 0 ? (
              <div className="space-y-4">
                {activePlans.map(plan => {
                  const planInfo = miningPlans.find(p => p.id === plan.id);
                  return (
                    <div key={plan.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{planInfo?.name || plan.id.charAt(0).toUpperCase() + plan.id.slice(1)} Plan</h3>
                        <span className="text-green-600 text-sm font-medium">{plan.boostMultiplier}x Boost</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>Purchased: {new Date(plan.purchasedAt).toLocaleDateString()}</div>
                        <div>Expires: {new Date(plan.expiresAt).toLocaleDateString()}</div>
                        {planInfo && (
                          <div className="col-span-2 mt-1">
                            <span className="text-green-600 font-medium">+{formatCurrency(planInfo.dailyEarnings)}</span> daily earnings
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">You don't have any active plans</p>
                <Button 
                  className="mt-4"
                  onClick={() => navigate('/plans')}
                >
                  View Available Plans
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 p-5">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center mr-4">
                <History className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">USDT Transactions</h2>
                <p className="text-sm text-gray-500">Your withdrawal history</p>
              </div>
            </div>
          </div>
          
          <div className="p-5">
            {withdrawalHistory.length > 0 ? (
              <div className="space-y-3">
                {withdrawalHistory.map((request) => (
                  <div key={request.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-500 text-sm">
                        {new Date(request.createdAt).toLocaleDateString()} 
                        {' '} 
                        {new Date(request.createdAt).toLocaleTimeString()}
                      </span>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-900 font-medium">{formatCurrency(request.amount)}</span>
                      <span className="text-gray-500 text-sm truncate max-w-[150px]">{request.address}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No transactions yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Your withdrawal history will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Wallet;
