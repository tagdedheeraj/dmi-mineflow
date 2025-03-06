
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMining } from '@/contexts/MiningContext';
import Header from '@/components/Header';
import MainnetCard from '@/components/MainnetCard';
import MiningCard from '@/components/MiningCard';
import MiningPlans from '@/components/MiningPlans';
import CoinValueCard from '@/components/CoinValueCard';
import LiveRatesCard from '@/components/LiveRatesCard';
import BoosterCard from '@/components/mining/BoosterCard';
import RewardsCards from '@/components/mining/RewardsCards';
import LoadingScreen from '@/components/mining/LoadingScreen';

const Mining: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  const mainnetLaunchDate = new Date('2025-08-26');
  const daysLeft = 176;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleBoosterPurchase = () => {
    navigate('/plans#dmi-boosters');
  };

  const handleViewMorePlans = () => {
    navigate('/plans#dmi-boosters');
  };

  if (loading || !isAuthenticated) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-fade-in">
      <Header />
      
      <main className="pt-24 px-4 max-w-screen-md mx-auto">
        <div className="space-y-6">
          <MainnetCard 
            launchDate={mainnetLaunchDate} 
            daysLeft={daysLeft} 
          />
          
          <MiningCard />
          
          <MiningPlans />
          
          <BoosterCard 
            onBoosterPurchase={handleBoosterPurchase}
            onViewMorePlans={handleViewMorePlans}
          />
          
          <CoinValueCard />
          
          <LiveRatesCard />
          
          <RewardsCards />
        </div>
      </main>
    </div>
  );
};

export default Mining;
