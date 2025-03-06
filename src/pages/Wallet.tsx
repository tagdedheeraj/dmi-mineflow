
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMining } from '@/contexts/MiningContext';
import Header from '@/components/Header';
import { useUsdtAddress } from '@/hooks/useUsdtAddress';
import { useWalletWithdrawals } from '@/hooks/useWalletWithdrawals';
import DMIBalanceSection from '@/components/wallet/DMIBalanceSection';
import USDTEarningsSection from '@/components/wallet/USDTEarningsSection';
import BoostSection from '@/components/wallet/BoostSection';
import ActivePlansSection from '@/components/wallet/ActivePlansSection';
import TransactionsSection from '@/components/wallet/TransactionsSection';
import WithdrawalModal from '@/components/wallet/WithdrawalModal';
import { miningPlans } from '@/data/miningPlans';

const Wallet: React.FC = () => {
  const { user, updateUser, isAdmin } = useAuth();
  const { activePlans, miningRate } = useMining();
  const navigate = useNavigate();

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

  // USDT address management
  const {
    usdtAddress,
    setUsdtAddressState,
    isSettingAddress,
    setIsSettingAddress,
    handleSetUsdtAddress
  } = useUsdtAddress(user, updateUser);

  // Withdrawal management
  const {
    withdrawalRequests,
    withdrawalAmount,
    setWithdrawalAmount,
    isWithdrawalModalOpen,
    setIsWithdrawalModalOpen,
    isLoading,
    handleWithdraw,
    submitWithdrawalRequest
  } = useWalletWithdrawals(user);

  if (!user) {
    navigate('/signin');
    return null;
  }

  const handleWithdrawalClick = () => {
    const result = handleWithdraw(usdtEarnings, user.usdtAddress);
    if (result.showAddressForm) {
      setIsSettingAddress(true);
    }
  };

  const handleConfirmWithdrawal = () => {
    submitWithdrawalRequest(user, withdrawalAmount, updateUser);
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
            <button 
              className="px-4 py-2 bg-white rounded shadow text-dmi font-medium"
              onClick={() => navigate('/admin')}
            >
              Go to Admin Dashboard
            </button>
          </div>
        )}
      
        <DMIBalanceSection 
          user={user} 
          dailyDmiEarnings={dailyDmiEarnings}
          weeklyDmiEarnings={weeklyDmiEarnings}
          monthlyDmiEarnings={monthlyDmiEarnings}
        />
        
        <USDTEarningsSection 
          user={user}
          dailyUsdtEarnings={dailyUsdtEarnings}
          weeklyUsdtEarnings={weeklyUsdtEarnings}
          monthlyUsdtEarnings={monthlyUsdtEarnings}
          isSettingAddress={isSettingAddress}
          usdtAddress={usdtAddress}
          setUsdtAddressState={setUsdtAddressState}
          handleSetUsdtAddress={handleSetUsdtAddress}
          setIsSettingAddress={setIsSettingAddress}
          handleWithdraw={handleWithdrawalClick}
        />
        
        <BoostSection />
        
        <ActivePlansSection activePlans={activePlans} />

        <TransactionsSection withdrawalRequests={withdrawalRequests} />

        <WithdrawalModal
          isOpen={isWithdrawalModalOpen}
          onOpenChange={setIsWithdrawalModalOpen}
          withdrawalAmount={withdrawalAmount}
          setWithdrawalAmount={setWithdrawalAmount}
          usdtEarnings={usdtEarnings}
          usdtAddress={user.usdtAddress || ''}
          isLoading={isLoading}
          onConfirm={handleConfirmWithdrawal}
        />
      </main>
    </div>
  );
};

export default Wallet;
