
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet, Diamond } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from '@/components/Header';
import { Video, Gift, Users, Trophy } from 'lucide-react';

// Import custom components
import RewardStats from '@/components/rewards/RewardStats';
import RewardsTabContent from '@/components/rewards/RewardsTabContent';
import useRewards from '@/hooks/useRewards';

const Rewards: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const {
    isWatchingAd,
    isAdComplete,
    countdownTime,
    todayAdsWatched,
    todayEarnings,
    activeTab,
    setActiveTab,
    MAX_DAILY_ADS,
    handleWatchAd,
    formatCountdown,
    completedTasks,
    handleCompleteTask
  } = useRewards();
  
  // If no user is logged in, redirect to sign in
  if (!user) {
    navigate('/signin');
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16 animate-fade-in">
      {/* Header */}
      <Header />
      
      {/* Main content */}
      <main className="pt-24 px-4 max-w-screen-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Rewards Center</h1>
          <Button variant="outline" onClick={() => navigate('/wallet')} className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            My Wallet
          </Button>
        </div>
        
        {/* Reward stats overview */}
        <RewardStats 
          todayEarnings={todayEarnings}
          todayAdsWatched={todayAdsWatched}
          maxDailyAds={MAX_DAILY_ADS}
          countdownTime={countdownTime}
        />
        
        {/* Tabs for different reward types */}
        <Tabs defaultValue="videos" className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="videos" className="flex items-center justify-center">
              <Video className="h-4 w-4 mr-2" />
              Watch & Earn
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center justify-center">
              <Users className="h-4 w-4 mr-2" />
              Refer & Earn
            </TabsTrigger>
            <TabsTrigger value="special" className="flex items-center justify-center" disabled>
              <Gift className="h-4 w-4 mr-2" />
              Special Offers
            </TabsTrigger>
          </TabsList>
          
          <RewardsTabContent
            activeTab={activeTab}
            isWatchingAd={isWatchingAd}
            isAdComplete={isAdComplete}
            countdownTime={countdownTime}
            todayAdsWatched={todayAdsWatched}
            maxDailyAds={MAX_DAILY_ADS}
            onWatchAd={handleWatchAd}
            formatCountdown={formatCountdown}
            completedTasks={completedTasks}
            onCompleteTask={handleCompleteTask}
          />
        </Tabs>
      </main>
    </div>
  );
};

export default Rewards;
