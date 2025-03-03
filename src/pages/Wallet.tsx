import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMining } from '@/contexts/MiningContext';
import Header from '@/components/Header';
import { getWithdrawalRequests } from '@/lib/storage';
import { DMI_COIN_VALUE, miningPlans } from '@/data/miningPlans';

// Import the wallet component cards
import DmiWalletCard from '@/components/wallet/DmiWalletCard';
import UsdtWalletCard from '@/components/wallet/UsdtWalletCard';
import MiningBoostCard from '@/components/wallet/MiningBoostCard';
import ActivePlansCard from '@/components/wallet/ActivePlansCard';
import TransactionsCard from '@/components/wallet/TransactionsCard';

const Wallet: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { activePlans, miningRate } = useMining();
  const navigate = useNavigate();
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);

  // Calculate mining rates and earnings
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

  // Load withdrawal history on component mount
  useEffect(() => {
    loadWithdrawalHistory();
  }, [user?.id]);

  // Redirect if not logged in
  if (!user) {
    navigate('/signin');
    return null;
  }

  // Function to refresh withdrawal history
  const loadWithdrawalHistory = () => {
    const requests = getWithdrawalRequests();
    const userRequests = requests.filter((req) => req.userId === user?.id);
    setWithdrawalHistory(userRequests);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-fade-in">
      <Header />
      
      <main className="pt-24 px-4 max-w-screen-md mx-auto">
        {/* DMI Wallet Card */}
        <DmiWalletCard 
          userBalance={user.balance}
          dailyDmiEarnings={dailyDmiEarnings}
          weeklyDmiEarnings={weeklyDmiEarnings}
          monthlyDmiEarnings={monthlyDmiEarnings}
        />
        
        {/* USDT Wallet Card */}
        <UsdtWalletCard
          user={user}
          usdtEarnings={usdtEarnings}
          dailyUsdtEarnings={dailyUsdtEarnings}
          weeklyUsdtEarnings={weeklyUsdtEarnings}
          monthlyUsdtEarnings={monthlyUsdtEarnings}
          updateUser={updateUser}
          refreshWithdrawalHistory={loadWithdrawalHistory}
        />
        
        {/* Mining Boost Card */}
        <MiningBoostCard />
        
        {/* Active Plans Card */}
        <ActivePlansCard activePlans={activePlans} />
        
        {/* Transactions Card */}
        <TransactionsCard withdrawalHistory={withdrawalHistory} />
      </main>
    </div>
  );
};

export default Wallet;
