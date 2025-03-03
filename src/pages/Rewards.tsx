
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMining } from '@/contexts/MiningContext';
import { Video, Timer, Coins, X, Check, Play, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { updateUserBalance } from '@/lib/storage';
import { formatNumber } from '@/lib/utils';

// Mock Unity Ads integration
// In a real app, you would integrate with the Unity Ads SDK
const mockUnityAds = {
  isReady: () => true,
  show: (callback: () => void) => {
    // Simulate ad playback for 5 seconds in the demo
    setTimeout(callback, 5000);
  }
};

const Rewards: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State for ad viewing and rewards
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [isAdComplete, setIsAdComplete] = useState(false);
  const [countdownTime, setCountdownTime] = useState(0);
  const [todayAdsWatched, setTodayAdsWatched] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);
  
  // Maximum daily ad limit
  const MAX_DAILY_ADS = 20;
  
  // Get today's date in YYYY-MM-DD format for tracking ads watched
  const getTodayDateKey = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };
  
  // Initialize state on component mount
  useEffect(() => {
    const todayKey = getTodayDateKey();
    const storedWatchedAds = localStorage.getItem(`dmi_ads_watched_${todayKey}`);
    const storedEarnings = localStorage.getItem(`dmi_ads_earnings_${todayKey}`);
    
    if (storedWatchedAds) {
      setTodayAdsWatched(parseInt(storedWatchedAds, 10));
    }
    
    if (storedEarnings) {
      setTodayEarnings(parseInt(storedEarnings, 10));
    }
  }, []);
  
  // Handle countdown logic
  useEffect(() => {
    let timer: number | undefined;
    
    if (countdownTime > 0) {
      timer = window.setInterval(() => {
        setCountdownTime(prevTime => prevTime - 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdownTime]);
  
  // Update local storage when values change
  useEffect(() => {
    const todayKey = getTodayDateKey();
    localStorage.setItem(`dmi_ads_watched_${todayKey}`, todayAdsWatched.toString());
    localStorage.setItem(`dmi_ads_earnings_${todayKey}`, todayEarnings.toString());
  }, [todayAdsWatched, todayEarnings]);
  
  // Format countdown time as MM:SS
  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };
  
  // Handle watching an ad
  const handleWatchAd = () => {
    if (todayAdsWatched >= MAX_DAILY_ADS) {
      toast({
        title: "Daily Limit Reached",
        description: "You've reached your daily limit of 20 ads. Come back tomorrow!",
        variant: "destructive",
      });
      return;
    }
    
    if (countdownTime > 0) {
      toast({
        title: "Please Wait",
        description: `Next ad will be available in ${formatCountdown(countdownTime)}`,
      });
      return;
    }
    
    // Start watching ad
    setIsWatchingAd(true);
    
    // Simulate Unity ad display
    mockUnityAds.show(() => {
      // Ad completed
      setIsWatchingAd(false);
      setIsAdComplete(true);
      
      // Update user's balance (add 1 DMI coin)
      if (user) {
        const updatedUser = updateUserBalance(1);
        if (updatedUser) {
          updateUser(updatedUser);
        }
      }
      
      // Update today's stats
      setTodayAdsWatched(prev => prev + 1);
      setTodayEarnings(prev => prev + 1);
      
      // Start countdown for next ad (1 minute = 60 seconds)
      setCountdownTime(60);
      
      // Show success toast
      toast({
        title: "Reward Earned!",
        description: "You've earned 1 DMI coin for watching the ad.",
      });
      
      // Reset ad complete state after a short delay
      setTimeout(() => {
        setIsAdComplete(false);
      }, 3000);
    });
  };
  
  // If no user is logged in, redirect to sign in
  if (!user) {
    navigate('/signin');
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <Header />
      
      {/* Main content */}
      <main className="pt-24 px-4 max-w-screen-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Rewards</h1>
        
        {/* Watch Ad Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-full bg-dmi/10 flex items-center justify-center mr-4">
              <Video className="h-5 w-5 text-dmi" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">Watch Ads to Earn DMI</h2>
              <p className="text-sm text-gray-500">Watch short ads and earn DMI coins</p>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="bg-gray-100 h-2 rounded-full mb-2">
            <div 
              className="bg-dmi h-2 rounded-full"
              style={{ width: `${(todayAdsWatched / MAX_DAILY_ADS) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 text-center mb-6">
            {todayAdsWatched} / {MAX_DAILY_ADS} ads watched today
          </p>
          
          {isWatchingAd ? (
            // Ad watching state
            <div className="bg-gray-50 p-6 rounded-lg text-center">
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
                <Timer className="h-6 w-6 text-gray-400 mr-2" />
                <span className="text-2xl font-bold text-gray-700">{formatCountdown(countdownTime)}</span>
              </div>
              <p className="text-gray-800 font-medium">Next ad available in</p>
              <p className="text-sm text-gray-500 mt-2">Please wait for the countdown to complete</p>
            </div>
          ) : (
            // Ready to watch state
            <Button 
              className="w-full py-6 text-base flex items-center justify-center"
              onClick={handleWatchAd}
              disabled={todayAdsWatched >= MAX_DAILY_ADS}
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Ad to Earn 1 DMI
            </Button>
          )}
          
          {todayAdsWatched >= MAX_DAILY_ADS && (
            <p className="text-sm text-amber-600 mt-4 text-center">
              You've reached your daily limit. Come back tomorrow for more rewards!
            </p>
          )}
        </div>
        
        {/* Daily Stats Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Today's Earnings</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center mb-2">
                <Coins className="h-5 w-5 text-dmi mr-2" />
                <span className="text-lg font-bold">{todayEarnings} DMI</span>
              </div>
              <p className="text-sm text-gray-500">Earned Today</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center mb-2">
                <Video className="h-5 w-5 text-gray-600 mr-2" />
                <span className="text-lg font-bold">{todayAdsWatched}</span>
              </div>
              <p className="text-sm text-gray-500">Ads Watched</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => navigate('/wallet')}
          >
            <Wallet className="mr-2 h-4 w-4" />
            Go to Wallet
          </Button>
        </div>
        
        {/* How It Works Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-medium text-gray-900 mb-4">How It Works</h2>
          
          <div className="space-y-4">
            <div className="flex">
              <div className="h-6 w-6 rounded-full bg-dmi/10 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-bold text-dmi">1</span>
              </div>
              <div>
                <p className="text-gray-800">Watch short ads to earn DMI coins</p>
                <p className="text-sm text-gray-500">Each ad earns you 1 DMI coin</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="h-6 w-6 rounded-full bg-dmi/10 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-bold text-dmi">2</span>
              </div>
              <div>
                <p className="text-gray-800">Wait 1 minute between ads</p>
                <p className="text-sm text-gray-500">Countdown timer will show when next ad is available</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="h-6 w-6 rounded-full bg-dmi/10 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-bold text-dmi">3</span>
              </div>
              <div>
                <p className="text-gray-800">Watch up to 20 ads per day</p>
                <p className="text-sm text-gray-500">Daily limit resets at midnight</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Rewards;
