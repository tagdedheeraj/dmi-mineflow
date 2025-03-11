import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  History,
  AlertTriangle,
  RefreshCw,
  Check
} from 'lucide-react';
import { DMI_COIN_VALUE, miningPlans } from '@/data/miningPlans';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { setUsdtAddress, getUser } from '@/lib/firestore';
import { createWithdrawalRequest, getUserWithdrawalRequests } from '@/lib/withdrawals';
import { WithdrawalRequest } from '@/lib/withdrawalTypes';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const Wallet: React.FC = () => {
  const { user, updateUser, isAdmin } = useAuth();
  const { activePlans, miningRate } = useMining();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [usdtAddress, setUsdtAddressState] = useState(user?.usdtAddress || '');
  const [isSettingAddress, setIsSettingAddress] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(0);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [planDaysRemaining, setPlanDaysRemaining] = useState<Record<string, number>>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    if (user) {
      const refreshUserData = async () => {
        try {
          console.log("Refreshing user data from Wallet page, user ID:", user.id);
          setIsRefreshing(true);
          const latestUserData = await getUser(user.id);
          if (latestUserData) {
            console.log("Updated user data:", latestUserData);
            console.log("USDT Earnings:", latestUserData.usdtEarnings);
            updateUser(latestUserData);
          }
          loadWithdrawalRequests();
          setIsRefreshing(false);
        } catch (error) {
          console.error("Error refreshing user data:", error);
          setIsRefreshing(false);
        }
      };
      
      refreshUserData();

      // Set up periodic refresh
      const intervalId = setInterval(() => {
        console.log("Running periodic user data refresh");
        refreshUserData();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(intervalId);
    }
  }, [user, location.pathname, refreshTrigger]);

  useEffect(() => {
    const calculateRemainingDays = () => {
      const daysMap: Record<string, number> = {};
      
      activePlans.forEach(plan => {
        const expiryDate = new Date(plan.expiresAt);
        const now = new Date();
        
        const diffTime = expiryDate.getTime() - now.getTime();
        const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
        
        daysMap[plan.id] = diffDays;
      });
      
      setPlanDaysRemaining(daysMap);
    };
    
    calculateRemainingDays();
    
    const intervalId = setInterval(calculateRemainingDays, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [activePlans]);

  const loadWithdrawalRequests = async () => {
    if (!user) return;
    
    try {
      const requests = await getUserWithdrawalRequests(user.id);
      setWithdrawalRequests(requests);
    } catch (error) {
      console.error("Failed to load withdrawal requests:", error);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      console.log("Manual refresh triggered");
      // Wait for user data to be fetched
      if (user) {
        const latestUserData = await getUser(user.id);
        if (latestUserData) {
          console.log("Manual refresh - updated user data:", latestUserData);
          console.log("Manual refresh - USDT Earnings:", latestUserData.usdtEarnings);
          updateUser(latestUserData);
          
          toast({
            title: "Balance Updated",
            description: "Your wallet balance has been refreshed.",
          });
        }
      }
      
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error during manual refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!user) {
    navigate('/signin');
    return null;
  }

  const handleSetUsdtAddress = async () => {
    if (usdtAddress.trim().length < 10) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid USDT BEP20 address",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedUser = await setUsdtAddress(user.id, usdtAddress);
      if (updatedUser) {
        updateUser(updatedUser);
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

  const handleWithdraw = async () => {
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

    setIsWithdrawalModalOpen(true);
    setWithdrawalAmount(usdtEarnings);
  };

  const submitWithdrawalRequest = async () => {
    if (!user) return;

    if (withdrawalAmount <= 0 || withdrawalAmount > usdtEarnings) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const requestId = await createWithdrawalRequest(
        user.id,
        user.fullName,
        user.email,
        withdrawalAmount,
        user.usdtAddress || ''
      );

      if (requestId) {
        const updatedUser = { 
          ...user, 
          usdtEarnings: user.usdtEarnings ? user.usdtEarnings - withdrawalAmount : 0 
        };
        updateUser(updatedUser);
        
        setIsWithdrawalModalOpen(false);
        toast({
          title: "Withdrawal Requested",
          description: "Your withdrawal request has been submitted and will be processed shortly.",
        });
        
        loadWithdrawalRequests();
      } else {
        throw new Error("Failed to create withdrawal request");
      }
    } catch (error) {
      console.error("Error creating withdrawal request:", error);
      toast({
        title: "Error",
        description: "Failed to submit withdrawal request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-fade-in">
      <Header />
      
      <main className="pt-24 px-4 max-w-screen-md mx-auto">
        {isAdmin && (
          <div className="mb-6 bg-dmi/10 rounded-xl p-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium">Admin Access</h2>
              <p className="text-sm text-gray-600">You have administrator privileges</p>
            </div>
            <Button onClick={() => navigate('/admin')}>
              Go to Admin Dashboard
            </Button>
          </div>
        )}
      
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="border-b border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-dmi/10 flex items-center justify-center mr-4">
                  <WalletIcon className="h-5 w-5 text-dmi" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">DMI Balance</h2>
                  <p className="text-sm text-gray-600">Current mining rewards</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                className="relative"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
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
                ID: {user?.id?.substring(0, 8)}
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
                  onClick={handleRefresh}
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
                {activePlans.filter(plan => new Date() < new Date(plan.expiresAt)).map(plan => {
                  const planInfo = miningPlans.find(p => p.id === plan.id);
                  const daysRemaining = planDaysRemaining[plan.id] || 0;
                  const totalDays = planInfo?.duration || 30;
                  const progressPercent = Math.max(0, Math.min(100, (daysRemaining / totalDays) * 100));
                  
                  return (
                    <div key={plan.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{planInfo?.name || 'Mining Plan'}</h3>
                          {plan.planCost && (
                            <p className="text-sm text-gray-600 mt-1">
                              Investment: ${plan.planCost}
                            </p>
                          )}
                        </div>
                        <span className="text-green-600 text-sm font-medium">{plan.boostMultiplier}x Boost</span>
                      </div>
                      
                      <div className="mt-3 mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{daysRemaining} days remaining</span>
                          <span className="text-gray-600">{totalDays} days total</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                      
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>Purchased: {new Date(plan.purchasedAt).toLocaleDateString()}</div>
                        <div>Expires: {new Date(plan.expiresAt).toLocaleDateString()}</div>
                      </div>

                      {planInfo && (
                        <div className="mt-3 bg-green-50 p-3 rounded-md space-y-2">
                          <div className="flex items-center text-green-700">
                            <Check className="h-4 w-4 mr-2" />
                            <span>Daily USDT Earnings: ${planInfo.dailyEarnings}</span>
                          </div>
                          <div className="flex items-center text-green-700">
                            <Check className="h-4 w-4 mr-2" />
                            <span>Total USDT Earnings: ${planInfo.totalEarnings}</span>
                          </div>
                          <div className="flex items-center text-green-700">
                            <Check className="h-4 w-4 mr-2" />
                            <span>{planInfo.withdrawalTime}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-3 bg-blue-50 p-2 rounded flex items-center text-sm text-blue-700">
                        <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>
                          {daysRemaining <= 0 
                            ? "Plan has expired" 
                            : daysRemaining === 1 
                              ? "Plan expires tomorrow" 
                              : `Plan expires in ${daysRemaining} days`}
                        </span>
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
            {withdrawalRequests.length > 0 ? (
              <div className="space-y-4">
                {withdrawalRequests.map(request => (
                  <div key={request.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-gray-900 font-medium">{formatCurrency(request.amount)}</div>
                        <div className="text-gray-500 text-sm">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                    {request.status === 'rejected' && request.rejectionReason && (
                      <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded flex items-start">
                        <AlertTriangle className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
                        <span>{request.rejectionReason}</span>
                      </div>
                    )}
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

        <Dialog open={isWithdrawalModalOpen} onOpenChange={setIsWithdrawalModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw USDT</DialogTitle>
              <DialogDescription>
                Enter the amount you want to withdraw. The funds will be sent to your registered USDT address.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="withdrawal-amount">Withdrawal Amount (USDT)</Label>
                <Input
                  id="withdrawal-amount"
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
                  min={50}
                  max={usdtEarnings}
                  step={1}
                />
                <p className="text-xs text-gray-500">
                  Available balance: {formatCurrency(usdtEarnings)}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Withdrawal Address</Label>
                <div className="p-3 bg-gray-50 rounded-md text-sm font-mono break-all">
                  {user.usdtAddress}
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Important Notes:</p>
                <ul className="text-xs text-gray-600 list-disc pl-5 space-y-1">
                  <li>Minimum withdrawal amount is $50 USDT</li>
                  <li>Withdrawals are processed within 24-48 hours</li>
                  <li>Make sure your withdrawal address is correct</li>
                </ul>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsWithdrawalModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={submitWithdrawalRequest} 
                disabled={withdrawalAmount < 50 || withdrawalAmount > usdtEarnings || isLoading}
              >
                {isLoading ? "Processing..." : "Confirm Withdrawal"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Wallet;
