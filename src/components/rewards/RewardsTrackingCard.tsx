
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Coins, Award, UserCheck, PlayCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { fetchRewardsData } from '@/lib/rewards/rewardsTracking';
import { getUser } from '@/lib/storage';

interface RewardsSummary {
  dmi: {
    mining: number;
    referrals: number;
    tasks: number;
    videos: number;
    total: number;
  };
  usdt: {
    mining: number;
    referrals: number;
    tasks: number;
    videos: number;
    total: number;
  };
}

const RewardsTrackingCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dmi' | 'usdt'>('dmi');
  const [rewardsSummary, setRewardsSummary] = useState<RewardsSummary>({
    dmi: { mining: 0, referrals: 0, tasks: 0, videos: 0, total: 0 },
    usdt: { mining: 0, referrals: 0, tasks: 0, videos: 0, total: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRewardsData = async () => {
      setIsLoading(true);
      try {
        const user = getUser();
        if (user) {
          // Fetch rewards data from Firestore
          const rewardsData = await fetchRewardsData(user.id);
          
          // This would be replaced with actual data from the backend
          // For now, we'll use some example data
          const summary: RewardsSummary = {
            dmi: {
              mining: user.balance || 0,
              referrals: 250,
              tasks: 120,
              videos: 180,
              total: (user.balance || 0) + 250 + 120 + 180
            },
            usdt: {
              mining: user.usdtEarnings || 0,
              referrals: 2.5,
              tasks: 1.8,
              videos: 0.7,
              total: (user.usdtEarnings || 0) + 2.5 + 1.8 + 0.7
            }
          };
          
          setRewardsSummary(summary);
        }
      } catch (error) {
        console.error('Error loading rewards data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRewardsData();
  }, []);

  const renderRewardItem = (icon: React.ReactNode, label: string, amount: number, percentage: number) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 backdrop-blur-sm">
      <div className="flex items-center space-x-3">
        {icon}
        <span className="font-medium text-sm">{label}</span>
      </div>
      <div className="flex flex-col items-end">
        <span className="font-bold">{activeTab === 'dmi' ? amount.toFixed(0) : amount.toFixed(2)}</span>
        <div className={`flex items-center text-xs ${percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {percentage >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
          {Math.abs(percentage)}%
        </div>
      </div>
    </div>
  );

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-950 to-purple-900 text-white overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Coins className="h-5 w-5 mr-2" />
          Rewards Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="dmi" className="w-full" onValueChange={(value) => setActiveTab(value as 'dmi' | 'usdt')}>
          <TabsList className="grid grid-cols-2 mb-4 bg-white/10">
            <TabsTrigger value="dmi" className="data-[state=active]:bg-white/20">
              DMI Coins
            </TabsTrigger>
            <TabsTrigger value="usdt" className="data-[state=active]:bg-white/20">
              USDT Earnings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dmi" className="mt-0">
            <div className="space-y-3">
              <div className="bg-white/10 p-4 rounded-lg text-center mb-4">
                <div className="text-xs text-white/70 mb-1">Total DMI Earned</div>
                <div className="text-2xl font-bold">{rewardsSummary.dmi.total.toFixed(0)}</div>
              </div>
              
              <div className="space-y-2">
                {renderRewardItem(
                  <Coins className="h-4 w-4 text-blue-400" />, 
                  "Mining Rewards", 
                  rewardsSummary.dmi.mining, 
                  65
                )}
                
                {renderRewardItem(
                  <UserCheck className="h-4 w-4 text-green-400" />, 
                  "Referral Bonuses", 
                  rewardsSummary.dmi.referrals, 
                  23
                )}
                
                {renderRewardItem(
                  <Award className="h-4 w-4 text-yellow-400" />, 
                  "Task Completions", 
                  rewardsSummary.dmi.tasks, 
                  -12
                )}
                
                {renderRewardItem(
                  <PlayCircle className="h-4 w-4 text-red-400" />, 
                  "Video Rewards", 
                  rewardsSummary.dmi.videos, 
                  8
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="usdt" className="mt-0">
            <div className="space-y-3">
              <div className="bg-white/10 p-4 rounded-lg text-center mb-4">
                <div className="text-xs text-white/70 mb-1">Total USDT Earned</div>
                <div className="text-2xl font-bold">${rewardsSummary.usdt.total.toFixed(2)}</div>
              </div>
              
              <div className="space-y-2">
                {renderRewardItem(
                  <Coins className="h-4 w-4 text-blue-400" />, 
                  "Mining Rewards", 
                  rewardsSummary.usdt.mining, 
                  42
                )}
                
                {renderRewardItem(
                  <UserCheck className="h-4 w-4 text-green-400" />, 
                  "Referral Commissions", 
                  rewardsSummary.usdt.referrals, 
                  18
                )}
                
                {renderRewardItem(
                  <Award className="h-4 w-4 text-yellow-400" />, 
                  "Task Completions", 
                  rewardsSummary.usdt.tasks, 
                  5
                )}
                
                {renderRewardItem(
                  <PlayCircle className="h-4 w-4 text-red-400" />, 
                  "Video Rewards", 
                  rewardsSummary.usdt.videos, 
                  -2
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RewardsTrackingCard;
