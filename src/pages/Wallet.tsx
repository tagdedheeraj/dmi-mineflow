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
  AlertTriangle
} from 'lucide-react';
import { DMI_COIN_VALUE, miningPlans } from '@/data/miningPlans';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { setUsdtAddress } from '@/lib/firestore';
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

const Wallet: React.FC = () => {
  const { user, updateUser, isAdmin } = useAuth();
  const { activePlans, miningRate, claimDailyUsdt, canClaimPlan } = useMining();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [usdtAddress, setUsdtAddressState] = useState(user?.usdtAddress || '');
  const [isSettingAddress, setIsSettingAddress] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(0);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [claimingPlanId, setClaimingPlanId] = useState<string | null>(null);

  const dailyDmiEarnings = miningRate * 24;
  const weeklyDmiEarnings = dailyDmiEarnings * 7;
  const monthlyDmiEarnings = dailyDmiEarnings * 30;
  
  const dmiBalanceValue = (user?.balance || 0) * DMI_COIN_VALUE;
  
  const usdtEarnings = user?.usdtEarnings || 0;
  
  // Filter only valid plans (not expired)
  const validActivePlans = activePlans.filter(plan => new Date() < new Date(plan.expiresAt));
  
  const dailyUsdtEarnings = validActivePlans.reduce((total, plan) => {
    const planInfo = miningPlans.find(p => p.id === plan.id);
    return total + (planInfo?.dailyEarnings || 0);
  }, 0);
  
  const weeklyUsdtEarnings = dailyUsdtEarnings * 7;
  const monthlyUsdtEarnings = dailyUsdtEarnings * 30;

  useEffect(() => {
    if (user) {
      loadWithdrawalRequests();
    }
  }, [user, location.pathname]);

  useEffect(() => {
    // Add a debug log to check active plans when component mounts
    console.log("Active plans in Wallet:", activePlans);
    console.log("Valid active plans:", validActivePlans);
  }, [activePlans, validActivePlans]);

  const loadWithdrawalRequests = async () => {
    if (!user) return;
    
    try {
      const requests = await getUserWithdrawalRequests(user.id);
      setWithdrawalRequests(requests);
    } catch (error) {
      console.error("Failed to load withdrawal requests:", error);
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

  const handleClaimUsdt = async (planId: string) => {
    console.log("Claiming USDT for plan:", planId);
    setClaimingPlanId(planId);
    try {
      const plan = activePlans.find(p => p.id === planId);
      console.log("Plan found:", plan);
      
      if (!plan) {
        console.error("Plan not found:", planId);
        toast({
          title: "Claim Failed",
          description: "Plan not found.",
          variant: "destructive",
        });
        return;
      }
      
      const planInfo = miningPlans.find(p => p.id === planId);
      console.log("Plan info found:", planInfo);
      
      if (!planInfo) {
        console.error("Plan info not found for ID:", planId);
        toast({
          title: "Claim Failed",
          description: "Plan information not found.",
          variant: "destructive",
        });
        return;
      }
      
      const success = await claimDailyUsdt(planId);
      console.log("Claim result:", success);
      
      if (!success) {
        console.log("Failed to claim USDT");
      }
    } catch (error) {
      console.error("Error claiming USDT:", error);
      toast({
        title: "Claim Failed",
        description: "An error occurred while claiming USDT.",
        variant: "destructive",
      });
    } finally {
      setClaimingPlanId(null);
    }
  };

  const getNextClaimTime = (plan: typeof activePlans[0]) => {
    if (!plan.lastClaimed) return "Available now";
    
    const lastClaimedDate = new Date(plan.lastClaimed);
    const nextClaimDate = new Date(lastClaimedDate);
    nextClaimDate.setHours(nextClaimDate.getHours() + 24);
    
    const now = new Date();
    const timeUntilNextClaim = nextClaimDate.getTime() - now.getTime();
    
    if (timeUntilNextClaim <= 0) return "Available now";
    
    const hoursRemaining = Math.floor(timeUntilNextClaim / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeUntilNextClaim % (1000 * 60 * 60)) / (1000 * 60));
    
    return `Available in ${hoursRemaining}h ${minutesRemaining}m`;
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

  // Check if user has any active arbitrage plans
  const hasActiveArbitragePlans = validActivePlans.length > 0;

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
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-dmi/10 flex items-center justify-center mr-4">
                <WalletIcon className="h-5 w-5 text-dmi" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">DMI Balance</h2>
                <p className="text-sm text-gray-600">Current mining rewards</p>
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
        
        {validActivePlans.length > 0 && (
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
              {validActivePlans.length > 0 ? (
                <div className="space-y-4">
                  {validActivePlans.map(plan => {
                    const planInfo = miningPlans.find(p => p.id === plan.id);
                    const canClaim = canClaimPlan(plan);
                    const nextClaimTime = getNextClaimTime(plan);
                    
                    if (!planInfo) {
                      console.error("No plan info found for plan ID:", plan.id);
                      return (
                        <div key={plan.id} className="bg-red-50 rounded-lg p-4">
                          <p>Plan information missing. ID: {plan.id}</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div key={plan.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{planInfo.name}</h3>
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
                        
                        {canClaim ? (
                          <Button
                            className="w-full mt-3 bg-green-600 hover:bg-green-700"
                            onClick={() => handleClaimUsdt(plan.id)}
                            disabled={claimingPlanId === plan.id}
                          >
                            {claimingPlanId === plan.id ? "Claiming..." : "Claim USDT"}
                          </Button>
                        ) : (
                          <div className="w-full mt-3 flex items-center justify-center py-2 px-4 bg-gray-100 text-gray-500 rounded-md text-sm">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{nextClaimTime}</span>
                          </div>
                        )}
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
        )}

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
