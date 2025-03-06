import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMining } from '@/contexts/MiningContext';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import MainnetCard from '@/components/MainnetCard';
import MiningCard from '@/components/MiningCard';
import MiningPlans from '@/components/MiningPlans';
import CoinValueCard from '@/components/CoinValueCard';
import LiveRatesCard from '@/components/LiveRatesCard';
import { Clock, Sparkles, Trophy, Zap, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Mining: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  const mainnetLaunchDate = new Date('2025-08-26');
  
  const calculateDaysLeft = () => {
    const today = new Date();
    const diffTime = mainnetLaunchDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const currentDate = new Date('2025-03-03');
  
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-dmi border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
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
          
          <Card className="overflow-hidden border border-gray-100 shadow-md animate-fade-in" id="dmi-boosters">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-medium text-gray-900">DMI Booster</CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    Supercharge your mining speed with special booster packs
                  </CardDescription>
                </div>
                <div className="bg-yellow-500/10 text-yellow-600 p-2 rounded-lg">
                  <Zap className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-2 border border-gray-100 rounded-lg p-4 transition-all hover:shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">Standard Booster</h4>
                    <p className="text-sm text-gray-500 mt-1">30 days</p>
                  </div>
                  <div className="text-xl font-bold text-gray-900">$20</div>
                </div>
                
                <div className="mt-2">
                  <div className="flex items-center text-sm">
                    <Sparkles className="h-4 w-4 text-amber-500 mr-2" />
                    <span>2x faster mining for 30 days</span>
                  </div>
                  <div className="bg-yellow-500/20 text-yellow-700 px-3 py-1 rounded-md font-semibold mt-2 inline-block">
                    2x Mining Speed
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4 flex justify-center items-center space-x-2"
                  onClick={handleBoosterPurchase}
                >
                  <span>Purchase Now</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={handleViewMorePlans}
                >
                  View More Plans
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <CoinValueCard />
          
          <LiveRatesCard />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl shadow-sm border border-indigo-100 card-hover-effect overflow-hidden relative cursor-pointer" onClick={() => navigate('/rewards')}>
              <div className="absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 bg-indigo-100 rounded-full opacity-70"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 -mb-6 -ml-6 bg-purple-100 rounded-full opacity-50"></div>
              
              <div className="flex items-center mb-3">
                <div className="h-8 w-8 rounded-full bg-dmi/10 flex items-center justify-center mr-3">
                  <Users className="h-4 w-4 text-dmi" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Refer & Earn</h3>
                </div>
              </div>
              
              <div className="relative">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Now Available!
                </span>
                
                <p className="text-sm text-gray-600 mt-1">
                  Invite your friends and earn <span className="font-semibold">200 DMI coins</span> for each friend who joins using your referral code.
                </p>
                
                <p className="text-sm text-gray-600 mt-2 font-medium">
                  Start earning bonus coins today by sharing your unique referral link!
                </p>
                
                <Button 
                  className="mt-4 w-full bg-dmi hover:bg-dmi/90 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/rewards');
                  }}
                >
                  Start Referring
                </Button>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm border border-blue-100 card-hover-effect overflow-hidden relative cursor-pointer" onClick={() => navigate('/rewards')}>
              <div className="absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 bg-blue-100 rounded-full opacity-70"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 -mb-6 -ml-6 bg-indigo-100 rounded-full opacity-50"></div>
              
              <div className="flex items-center mb-3">
                <div className="h-8 w-8 rounded-full bg-dmi/10 flex items-center justify-center mr-3">
                  <Trophy className="h-4 w-4 text-dmi" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">DMI Rewards</h3>
                </div>
              </div>
              
              <div className="relative">
                <p className="text-sm text-gray-600 mt-1">
                  Watch ads and complete tasks to earn additional DMI coins
                </p>
                
                <Button 
                  className="mt-4 w-full bg-dmi hover:bg-dmi/90 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/rewards');
                  }}
                >
                  Earn Rewards
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Mining;
