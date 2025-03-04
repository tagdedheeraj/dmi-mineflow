
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import AdWatchCard from './AdWatchCard';
import HowItWorks from './HowItWorks';
import ComingSoon from './ComingSoon';
import ReferralSystem from './ReferralSystem';
import SocialMediaTasks from './SocialMediaTasks';

interface RewardsTabContentProps {
  activeTab: string;
  isWatchingAd: boolean;
  isAdComplete: boolean;
  countdownTime: number;
  todayAdsWatched: number;
  maxDailyAds: number;
  onWatchAd: () => void;
  formatCountdown: (seconds: number) => string;
  completedTasks: string[];
  onCompleteTask: (taskId: string, data?: any) => Promise<void>;
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
  completedTasks,
  onCompleteTask
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
        <SocialMediaTasks 
          completedTasks={completedTasks}
          onCompleteTask={onCompleteTask}
        />
      </TabsContent>
      
      <TabsContent value="referrals" className="mt-4">
        <ReferralSystem />
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
