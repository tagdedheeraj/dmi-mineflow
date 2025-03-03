
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Wallet, 
  ArrowUpRight, 
  DollarSign, 
  Zap, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  XCircle,
  ArrowRight
} from 'lucide-react';
import { formatNumber, formatCurrency } from '@/lib/utils';
import Header from '@/components/Header';
import BottomBar from '@/components/BottomBar';
import { useMediaQuery } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { setUsdtAddress, updateUsdtEarnings } from '@/lib/firestore';
import { createWithdrawalRequest, getUserWithdrawalRequests } from '@/lib/withdrawals';
import { WithdrawalRequest } from '@/lib/withdrawalTypes';
import { useToast } from '@/hooks/use-toast';

const WalletPage = () => {
  const { user, setUser, isAdmin } = useAuth();
  const [usdtAddress, setAddress] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('');
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRequest[]>([]);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useMediaQuery('(max-width: 640px)');

  // Load withdrawal history when user is available
  useEffect(() => {
    if (user) {
      loadWithdrawalHistory();
      setAddress(user.usdtAddress || '');
    }
  }, [user]);

  const loadWithdrawalHistory = async () => {
    if (!user) return;
    
    try {
      const requests = await getUserWithdrawalRequests(user.id);
      setWithdrawalHistory(requests);
    } catch (error) {
      console.error("Error loading withdrawal history:", error);
    }
  };

  const handleSaveUsdtAddress = async () => {
    if (!user || !usdtAddress.trim()) return;
    
    setIsSubmitting(true);
    try {
      const updatedUser = await setUsdtAddress(user.id, usdtAddress.trim());
      if (updatedUser) {
        setUser(updatedUser);
        toast({
          title: "Success",
          description: "USDT address saved successfully.",
        });
      }
    } catch (error) {
      console.error("Error saving USDT address:", error);
      toast({
        title: "Error",
        description: "Failed to save USDT address. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawalSubmit = async () => {
    if (!user || !user.usdtAddress || !withdrawalAmount) return;
    
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      });
      return;
    }
    
    if (amount > (user.usdtEarnings || 0)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough USDT earnings for this withdrawal.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const requestId = await createWithdrawalRequest(
        user.id,
        user.fullName,
        user.email,
        amount,
        user.usdtAddress
      );
      
      if (requestId) {
        // Refresh user data to get updated USDT earnings
        setUser({
          ...user,
          usdtEarnings: (user.usdtEarnings || 0) - amount
        });
        
        // Refresh withdrawal history
        await loadWithdrawalHistory();
        
        toast({
          title: "Withdrawal Requested",
          description: `Your withdrawal request for ${formatCurrency(amount)} has been submitted and is pending approval.`,
        });
        
        setWithdrawalAmount('');
        setWithdrawalDialogOpen(false);
      } else {
        throw new Error("Failed to create withdrawal request");
      }
    } catch (error) {
      console.error("Error submitting withdrawal request:", error);
      toast({
        title: "Error",
        description: "Failed to submit withdrawal request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Wallet" />
      
      <main className="flex-1 container max-w-md mx-auto px-4 py-6">
        {/* DMI Balance Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center">
              <Wallet className="mr-2 h-5 w-5 text-dmi" />
              DMI Balance
            </CardTitle>
            <CardDescription>Your current mining earnings</CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{formatNumber(user?.balance || 0)}</span>
              <span className="ml-2 text-gray-500">DMI</span>
            </div>
          </CardContent>
        </Card>
        
        {/* USDT Earnings Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-green-600" />
              USDT Earnings
            </CardTitle>
            <CardDescription>
              Your balance available for withdrawal
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{formatCurrency(user?.usdtEarnings || 0)}</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-0">
            <div className="grid w-full gap-2">
              <Input
                type="text"
                placeholder="Enter your USDT address (TRC20)"
                value={usdtAddress}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full"
              />
              <Button 
                onClick={handleSaveUsdtAddress} 
                disabled={isSubmitting || !usdtAddress.trim() || usdtAddress === user?.usdtAddress}
                className="w-full"
              >
                Save Address
              </Button>
            </div>
            
            {user?.usdtAddress && (
              <Dialog open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700" 
                    disabled={!user?.usdtEarnings || user.usdtEarnings <= 0}
                  >
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Withdraw USDT
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Withdraw USDT</DialogTitle>
                    <DialogDescription>
                      Enter the amount of USDT you want to withdraw to your wallet address.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Available balance:</span>
                      <span className="font-medium">{formatCurrency(user?.usdtEarnings || 0)}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="amount" className="text-sm font-medium">
                        Withdrawal Amount
                      </label>
                      <Input
                        id="amount"
                        type="number"
                        min="1"
                        step="0.01"
                        max={user?.usdtEarnings || 0}
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        placeholder="Enter amount"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Withdrawal Address</div>
                      <div className="bg-gray-100 p-2 rounded text-sm font-mono break-all">
                        {user?.usdtAddress}
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      onClick={handleWithdrawalSubmit}
                      disabled={isSubmitting || !withdrawalAmount || parseFloat(withdrawalAmount) <= 0 || parseFloat(withdrawalAmount) > (user?.usdtEarnings || 0)}
                    >
                      Confirm Withdrawal
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardFooter>
        </Card>
        
        {/* Withdrawal History */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Transaction History</CardTitle>
            <CardDescription>Your USDT withdrawal requests</CardDescription>
          </CardHeader>
          <CardContent>
            {withdrawalHistory.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p>No withdrawal requests yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {withdrawalHistory.map((request) => (
                  <div 
                    key={request.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div>
                      <div className="flex items-center">
                        <ArrowUpRight className="h-4 w-4 text-gray-600 mr-2" />
                        <span className="font-medium">{formatCurrency(request.amount)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(request.status)}
                      
                      {request.status === 'rejected' && request.rejectionReason && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Withdrawal Rejected</DialogTitle>
                              <DialogDescription>
                                Your withdrawal request was rejected for the following reason:
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <p className="text-sm bg-red-50 p-3 rounded border border-red-100 text-red-800">
                                {request.rejectionReason}
                              </p>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Admin Panel Link */}
        {isAdmin && (
          <Card className="mb-6 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white">
            <CardContent className="p-4">
              <Button 
                onClick={() => window.location.href = '/admin'} 
                variant="secondary" 
                className="w-full"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Go to Admin Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
      
      <BottomBar currentPath="/wallet" />
    </div>
  );
};

export default WalletPage;
