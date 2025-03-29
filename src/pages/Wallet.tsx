
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMining } from '@/contexts/MiningContext';
import Header from '@/components/Header';
import { DMI_COIN_VALUE, miningPlans } from '@/data/miningPlans';
import useWalletData from '@/hooks/useWalletData';

// Import wallet components
import WalletHeader from '@/components/wallet/WalletHeader';
import DMIBalanceCard from '@/components/wallet/DMIBalanceCard';
import USDTEarningsCard from '@/components/wallet/USDTEarningsCard';
import MiningSpeedCard from '@/components/wallet/MiningSpeedCard';
import ActivePlansCard from '@/components/wallet/ActivePlansCard';
import TransactionsCard from '@/components/wallet/TransactionsCard';
import WithdrawalModal from '@/components/wallet/WithdrawalModal';
import StakingCard from '@/components/wallet/StakingCard';

const Wallet: React.FC = () => {
  const { user, updateUser, isAdmin } = useAuth();
  const { activePlans, miningRate } = useMining();
  const navigate = useNavigate();

  // Calculate earnings
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

  // Use the wallet data hook
  const {
    withdrawalRequests,
    planDaysRemaining,
    isRefreshing,
    isWithdrawalModalOpen,
    setIsWithdrawalModalOpen,
    isLoading,
    claimableStatus,
    isClaimingPlan,
    handleRefresh,
    handleClaimEarnings,
    handleWithdrawalRequest,
    userId,
    updateUser: walletUpdateUser
  } = useWalletData(
    user?.id, 
    updateUser,
    activePlans,
    user?.balance || 0
  );

  if (!user) {
    navigate('/signin');
    return null;
  }

  // Check if user has a premium plan ($500 or higher)
  const hasPremiumPlan = activePlans.some(plan => {
    const planInfo = miningPlans.find(p => p.id === plan.id);
    return planInfo && planInfo.price >= 500;
  });

  const handleWithdraw = () => {
    setIsWithdrawalModalOpen(true);
  };

  // Simulated staking data for now - in a real app this would come from Firestore
  const stakingData = {
    totalStaked: user?.stakingData?.totalStaked || 0,
    totalEarned: user?.stakingData?.totalEarned || 0
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-fade-in">
      <Header />
      
      <main className="pt-24 px-4 max-w-screen-md mx-auto">
        {/* Admin Access Section */}
        <WalletHeader 
          isAdmin={isAdmin} 
          isRefreshing={isRefreshing} 
          onRefresh={handleRefresh} 
        />
      
        {/* DMI Balance Card */}
        <DMIBalanceCard 
          balance={user.balance}
          dmiValue={dmiBalanceValue}
          coinValue={DMI_COIN_VALUE}
          dailyEarnings={dailyDmiEarnings}
          weeklyEarnings={weeklyDmiEarnings}
          monthlyEarnings={monthlyDmiEarnings}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
        
        {/* USDT Earnings Card */}
        <USDTEarningsCard 
          userId={user.id}
          usdtEarnings={usdtEarnings}
          usdtAddress={user.usdtAddress || ''}
          dailyEarnings={dailyUsdtEarnings}
          weeklyEarnings={weeklyUsdtEarnings}
          monthlyEarnings={monthlyUsdtEarnings}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          onAddressUpdate={updateUser}
          onWithdraw={handleWithdraw}
        />
        
        {/* New Staking Card */}
        <StakingCard 
          userBalance={user.balance}
          hasAirdrop={true} // Example: Set based on actual airdrop status
          hasPremiumPlan={hasPremiumPlan}
          totalStaked={stakingData.totalStaked}
          totalEarned={stakingData.totalEarned}
          userId={user.id}
          updateUser={updateUser}
        />
        
        {/* Mining Speed Card */}
        <MiningSpeedCard />
        
        {/* Active Plans Card */}
        <ActivePlansCard 
          activePlans={activePlans}
          planDaysRemaining={planDaysRemaining}
          claimableStatus={claimableStatus}
          isClaimingPlan={isClaimingPlan}
          onClaimEarnings={handleClaimEarnings}
        />

        {/* Transactions Card */}
        <TransactionsCard withdrawalRequests={withdrawalRequests} />

        {/* Withdrawal Modal */}
        <WithdrawalModal 
          isOpen={isWithdrawalModalOpen}
          onOpenChange={setIsWithdrawalModalOpen}
          usdtAddress={user.usdtAddress || ''}
          usdtEarnings={usdtEarnings}
          onWithdraw={handleWithdrawalRequest}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
};

export default Wallet;
