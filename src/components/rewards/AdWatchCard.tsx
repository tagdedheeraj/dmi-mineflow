
import React from 'react';
import { Video, Play, Check, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdWatchCardProps {
  isWatchingAd: boolean;
  isAdComplete: boolean;
  countdownTime: number;
  todayAdsWatched: number;
  maxDailyAds: number;
  onWatchAd: () => void;
  formatCountdown: (seconds: number) => string;
}

const AdWatchCard: React.FC<AdWatchCardProps> = ({
  isWatchingAd,
  isAdComplete,
  countdownTime,
  todayAdsWatched,
  maxDailyAds,
  onWatchAd,
  formatCountdown,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 rounded-full bg-dmi/10 flex items-center justify-center mr-4">
            <Video className="h-5 w-5 text-dmi" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Watch Ads to Earn DMI</h2>
            <p className="text-sm text-gray-500">Watch short ads and earn 1 DMI coin per ad</p>
          </div>
        </div>
        
        {isWatchingAd ? (
          // Ad watching state
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <div className="animate-pulse mb-4">
              <Play className="h-10 w-10 text-dmi mx-auto" />
            </div>
            <p className="text-gray-800 font-medium">Watching ad...</p>
            <p className="text-sm text-gray-500 mt-2">Please don't close this screen</p>
          </div>
        ) : isAdComplete ? (
          // Ad completion state
          <div className="bg-green-50 p-6 rounded-lg text-center">
            <div className="mb-4 bg-green-100 h-14 w-14 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-gray-800 font-medium">Reward earned!</p>
            <p className="text-sm text-gray-500 mt-2">+1 DMI coin added to your wallet</p>
          </div>
        ) : countdownTime > 0 ? (
          // Countdown state
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <div className="mb-4 flex items-center justify-center">
              <Timer className="h-8 w-8 text-gray-400 mr-2" />
              <span className="text-3xl font-bold text-gray-700">{formatCountdown(countdownTime)}</span>
            </div>
            <p className="text-gray-800 font-medium">Next ad available in</p>
            <p className="text-sm text-gray-500 mt-2">Please wait for the countdown to complete</p>
          </div>
        ) : (
          // Ready to watch state
          <div className="text-center">
            <Button 
              className="w-full py-6 text-base flex items-center justify-center"
              onClick={onWatchAd}
              disabled={todayAdsWatched >= maxDailyAds}
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Ad to Earn 1 DMI
            </Button>
            
            {todayAdsWatched >= maxDailyAds && (
              <p className="text-sm text-amber-600 mt-4">
                You've reached your daily limit. Come back tomorrow for more rewards!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdWatchCard;
