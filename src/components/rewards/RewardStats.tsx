
import React from 'react';
import { Coins, Video, TrendingUp, Timer } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface RewardStatsProps {
  todayEarnings: number;
  todayAdsWatched: number;
  maxDailyAds: number;
  countdownTime: number;
}

const RewardStats: React.FC<RewardStatsProps> = ({
  todayEarnings,
  todayAdsWatched,
  maxDailyAds,
  countdownTime,
}) => {
  // Format countdown time as MM:SS
  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md overflow-hidden mb-6">
      <div className="p-6 text-white">
        <div className="flex items-center mb-4">
          <Diamond className="h-6 w-6 mr-2" />
          <h2 className="text-xl font-semibold">Your Rewards Summary</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-xs text-white/80">Today's Earnings</p>
            <p className="text-xl font-bold flex items-center">
              <Coins className="h-4 w-4 mr-1 text-yellow-300" />
              {todayEarnings} DMI
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-xs text-white/80">Ads Watched</p>
            <p className="text-xl font-bold flex items-center">
              <Video className="h-4 w-4 mr-1 text-blue-300" />
              {todayAdsWatched}/{maxDailyAds}
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-xs text-white/80">Current Rate</p>
            <p className="text-xl font-bold flex items-center">
              <TrendingUp className="h-4 w-4 mr-1 text-green-300" />
              1 DMI/Ad
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-xs text-white/80">Next Ad</p>
            <p className="text-xl font-bold flex items-center">
              <Timer className="h-4 w-4 mr-1 text-red-300" />
              {countdownTime > 0 ? formatCountdown(countdownTime) : "Ready"}
            </p>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-white/20">
        <div 
          className="h-full bg-gradient-to-r from-green-400 to-blue-400"
          style={{ width: `${(todayAdsWatched / maxDailyAds) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default RewardStats;
