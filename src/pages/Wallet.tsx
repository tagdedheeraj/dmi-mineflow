
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMining } from '@/contexts/MiningContext';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { setUsdtAddress } from '@/lib/firestore';
import { createWithdrawalRequest, getUserWithdrawalRequests } from '@/lib/withdrawals';
import { WithdrawalRequest } from '@/lib/withdrawalTypes';
import { DMI_COIN_VALUE, miningPlans } from '@/data/miningPlans';

// Import wallet components
import AdminPanel from '@/components/wallet/AdminPanel';
import DmiWalletCard from '@/components/wallet/DmiWalletCard';
import UsdtWalletCard from '@/components/wallet/UsdtWalletCard';
import MiningBoostCard from '@/components/wallet/MiningBoostCard';
import ActivePlansCard from '@/components/wallet/ActivePlansCard';
import TransactionHistoryCard from '@/components/wallet/TransactionHistoryCard';
import WithdrawalModal from '@/components/wallet/WithdrawalModal';

const Wallet: React.FC = () => {
  const { user, updateUser, isAdmin } = useAuth();
  const { activePlans, miningRate } = useMining();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [usdtAddress, setUsdtAddressState] = useState('');
  const [isSettingAddress, setIsSettingAddress] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(0);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate earnings
  const dailyDmiEarnings = miningRate * 24;
  const weeklyDmiEarnings = dailyDmiEarnings * 7;
  const monthlyDmiEarnings = dailyDmiEarnings * 30;
  
  const usdtEarnings = user?.usdtEarnings || 0;
  
  const dailyUsdtEarnings = activePlans.reduce((total, plan) => {
    const planInfo = miningPlans.find(p => p.id === plan.id);
    return total + (planInfo?.dailyEarnings || 0);
  }, 0);
  
  const weeklyUsdtEarnings = dailyUsdtEarnings * 7;
  const monthlyUsdtEarnings = dailyUsdtEarnings * 30;

  useEffect(() => {
    if (user) {
      setUsdtAddressState(user.usdtAddress || '');
      loadWithdrawalRequests();
    }
  }, [user]);

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

    // Show withdrawal amount selection modal
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
      // Create withdrawal request
      const requestId = await createWithdrawalRequest(
        user.id,
        user.fullName,
        user.email,
        withdrawalAmount,
        user.usdtAddress || ''
      );

      if (requestId) {
        // Deduct from user's USDT earnings
        const updatedUser = { 
          ...user, 
          usdtEarnings: user.usdtEarnings ? user.usdtEarnings - withdrawalAmount : 0 
        };
        updateUser(updatedUser);
        
        // Close modal and show success message
        setIsWithdrawalModalOpen(false);
        toast({
          title: "Withdrawal Requested",
          description: "Your withdrawal request has been submitted and will be processed shortly.",
        });
        
        // Reload withdrawal requests
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

  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-fade-in">
      <Header />
      
      <main className="pt-24 px-4 max-w-screen-md mx-auto">
        <AdminPanel isAdmin={isAdmin} />
        
        <DmiWalletCard 
          balance={user.balance}
          dailyEarnings={dailyDmiEarnings}
          weeklyEarnings={weeklyDmiEarnings}
          monthlyEarnings={monthlyDmiEarnings}
        />
        
        <UsdtWalletCard
          usdtEarnings={usdtEarnings}
          dailyEarnings={dailyUsdtEarnings}
          weeklyEarnings={weeklyUsdtEarnings}
          monthlyEarnings={monthlyUsdtEarnings}
          usdtAddress={usdtAddress}
          isSettingAddress={isSettingAddress}
          onAddressChange={setUsdtAddressState}
          onSaveAddress={handleSetUsdtAddress}
          onCancelAddressEdit={() => setIsSettingAddress(false)}
          onWithdrawClick={handleWithdraw}
          setIsSettingAddress={setIsSettingAddress}
        />
        
        <MiningBoostCard />
        
        <ActivePlansCard activePlans={activePlans} />
        
        <TransactionHistoryCard withdrawalRequests={withdrawalRequests} />
        
        <WithdrawalModal
          isOpen={isWithdrawalModalOpen}
          onOpenChange={setIsWithdrawalModalOpen}
          withdrawalAmount={withdrawalAmount}
          setWithdrawalAmount={setWithdrawalAmount}
          usdtEarnings={usdtEarnings}
          usdtAddress={user.usdtAddress || ''}
          isLoading={isLoading}
          onConfirmWithdrawal={submitWithdrawalRequest}
        />
      </main>
    </div>
  );
};

export default Wallet;
