
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import AdWatchCard from './AdWatchCard';
import HowItWorks from './HowItWorks';
import ComingSoon from './ComingSoon';

interface RewardsTabContentProps {
  activeTab: string;
  isWatchingAd: boolean;
  isAdComplete: boolean;
  countdownTime: number;
  todayAdsWatched: number;
  maxDailyAds: number;
  onWatchAd: () => void;
  formatCountdown: (seconds: number) => string;
}

const RewardsTabContent: React.FC<RewardsTabContentProps> = ({
  activeTab,
  isWatchingAd,
  isAdComplete,
  countdownTime,
  todayAdsWatched,
  maxDailyAds,
  onWatchAd,
  formatCountdown,
}) => {
  return (
    <>
      <TabsContent value="videos" className="mt-4">
        {/* Watch Ad Card */}
        <AdWatchCard
          isWatchingAd={isWatchingAd}
          isAdComplete={isAdComplete}
          countdownTime={countdownTime}
          todayAdsWatched={todayAdsWatched}
          maxDailyAds={maxDailyAds}
          onWatchAd={onWatchAd}
          formatCountdown={formatCountdown}
        />
        
        {/* How It Works Card */}
        <HowItWorks />
      </TabsContent>
      
      <TabsContent value="tasks" className="mt-4">
        <ComingSoon 
          title="Coming Soon"
          description="Daily tasks will allow you to earn additional DMI coins by completing simple activities."
        />
      </TabsContent>
      
      <TabsContent value="special" className="mt-4">
        <ComingSoon 
          title="Coming Soon"
          description="Special offers and promotions will be available here with opportunities to earn bonus DMI coins."
        />
      </TabsContent>
    </>
  );
};

export default RewardsTabContent;
