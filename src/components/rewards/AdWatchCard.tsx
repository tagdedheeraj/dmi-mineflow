import React, { useState, useEffect } from 'react';
import { Video, Play, Check, Timer, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adMob } from './admob';
import { TEST_MODE } from './admob/config';

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
  const [adStatus, setAdStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [adInitAttempts, setAdInitAttempts] = useState(0);

  // Initialize and check AdMob status more aggressively
  useEffect(() => {
    const checkAdStatus = () => {
      try {
        // Force initialization on component mount
        if (!adMob.isReady()) {
          adMob.initialize();
          setAdInitAttempts(prev => prev + 1);
          console.log(`AdMob initialization attempt: ${adInitAttempts + 1}`);
        }
        
        if (adMob.isReady()) {
          setAdStatus('ready');
          setErrorMessage('');
          console.log('AdMob is ready for display');
        } else {
          console.log('AdMob not ready yet, still loading...');
          
          // After several attempts, set an error message but keep trying
          if (adInitAttempts > 5 && adStatus !== 'ready') {
            setAdStatus('error');
            setErrorMessage('Having trouble loading ads. We\'ll keep trying...');
          }
        }
      } catch (error) {
        console.error('Error checking ad status:', error);
        setAdStatus('error');
        setErrorMessage('Error loading ads. We\'ll keep trying automatically.');
      }
    };

    // Check immediately
    checkAdStatus();

    // Then check every 2 seconds (more frequently)
    const intervalId = setInterval(checkAdStatus, 2000);

    return () => clearInterval(intervalId);
  }, [adInitAttempts]);

  // Reset error message when watching ad
  useEffect(() => {
    if (isWatchingAd) {
      setErrorMessage('');
    }
  }, [isWatchingAd]);

  const handleAdClick = () => {
    setErrorMessage('');
    console.log('Ad button clicked, attempting to show ad...');
    
    // Force another initialization attempt when user clicks
    if (!adMob.isReady()) {
      console.log('AdMob not ready, forcing initialization...');
      adMob.initialize();
    }
    
    onWatchAd();
  };

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
            {TEST_MODE && (
              <p className="text-xs text-amber-600 mt-1">Test Mode Active</p>
            )}
          </div>
        </div>
        
        {isWatchingAd ? (
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <div className="animate-pulse mb-4">
              <Play className="h-10 w-10 text-dmi mx-auto" />
            </div>
            <p className="text-gray-800 font-medium">Watching ad...</p>
            <p className="text-sm text-gray-500 mt-2">Please don't close this screen</p>
          </div>
        ) : isAdComplete ? (
          <div className="bg-green-50 p-6 rounded-lg text-center">
            <div className="mb-4 bg-green-100 h-14 w-14 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-gray-800 font-medium">Reward earned!</p>
            <p className="text-sm text-gray-500 mt-2">+1 DMI coin added to your wallet</p>
          </div>
        ) : countdownTime > 0 ? (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <div className="mb-4 flex items-center justify-center">
              <Timer className="h-8 w-8 text-gray-400 mr-2" />
              <span className="text-3xl font-bold text-gray-700">{formatCountdown(countdownTime)}</span>
            </div>
            <p className="text-gray-800 font-medium">Next ad available in</p>
            <p className="text-sm text-gray-500 mt-2">Please wait for the countdown to complete</p>
          </div>
        ) : (
          <div className="text-center">
            {errorMessage ? (
              <div className="bg-red-50 p-6 rounded-lg text-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 font-medium">{errorMessage}</p>
                <p className="text-sm text-gray-600 mt-2">We'll keep trying to load ads automatically</p>
              </div>
            ) : adStatus === 'loading' && !errorMessage ? (
              <div className="bg-gray-50 p-6 rounded-lg text-center mb-4">
                <div className="animate-spin h-8 w-8 border-4 border-dmi border-opacity-50 border-t-dmi rounded-full mx-auto mb-3"></div>
                <p className="text-gray-800">Loading ad system...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
              </div>
            ) : null}
            
            <Button 
              className="w-full py-6 text-base flex items-center justify-center bg-dmi hover:bg-dmi/90"
              onClick={handleAdClick}
              disabled={todayAdsWatched >= maxDailyAds || (adStatus === 'loading' && !errorMessage)}
            >
              <Play className="mr-2 h-5 w-5" />
              {TEST_MODE ? "Watch Test Ad to Earn 1 DMI" : "Watch Ad to Earn 1 DMI"}
            </Button>
            
            {todayAdsWatched >= maxDailyAds && (
              <p className="text-sm text-amber-600 mt-4">
                You've reached your daily limit. Come back tomorrow for more rewards!
              </p>
            )}
            
            <p className="text-xs text-gray-500 mt-4 italic">
              {todayAdsWatched < maxDailyAds ? 
                `${todayAdsWatched} of ${maxDailyAds} ads watched today` : 
                "All daily ads completed"}
            </p>
          </div>
        )}
      </div>
      
      {/* Hidden div to contain ads */}
      <div id="rewarded-ad-container" style={{ position: 'fixed', zIndex: 9999, top: 0, left: 0, width: '100%', height: '100%', display: 'none' }}></div>
    </div>
  );
};

export default AdWatchCard;
