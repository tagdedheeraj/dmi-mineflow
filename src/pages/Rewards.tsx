
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMining } from '@/contexts/MiningContext';
import { Video, Timer, Coins, Check, Play, Wallet, Award, Gift, Star, Diamond, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [activeTab, setActiveTab] = useState("videos");
  
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
                  {todayAdsWatched}/{MAX_DAILY_ADS}
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
              style={{ width: `${(todayAdsWatched / MAX_DAILY_ADS) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Tabs for different reward types */}
        <Tabs defaultValue="videos" className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="videos" className="flex items-center justify-center">
              <Video className="h-4 w-4 mr-2" />
              Watch Videos
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center justify-center" disabled>
              <Star className="h-4 w-4 mr-2" />
              Daily Tasks
            </TabsTrigger>
            <TabsTrigger value="special" className="flex items-center justify-center" disabled>
              <Gift className="h-4 w-4 mr-2" />
              Special Offers
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="videos" className="mt-4">
            {/* Watch Ad Card */}
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
                      onClick={handleWatchAd}
                      disabled={todayAdsWatched >= MAX_DAILY_ADS}
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Watch Ad to Earn 1 DMI
                    </Button>
                    
                    {todayAdsWatched >= MAX_DAILY_ADS && (
                      <p className="text-sm text-amber-600 mt-4">
                        You've reached your daily limit. Come back tomorrow for more rewards!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* How It Works Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-dmi" />
                How It Works
              </h2>
              
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
          </TabsContent>
          
          <TabsContent value="tasks" className="mt-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="py-8">
                <Gift className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-700">Coming Soon</h3>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  Daily tasks will allow you to earn additional DMI coins by completing simple activities.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="special" className="mt-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="py-8">
                <Gift className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-700">Coming Soon</h3>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  Special offers and promotions will be available here with opportunities to earn bonus DMI coins.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Rewards;
