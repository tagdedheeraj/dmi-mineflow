
import React, { useEffect } from 'react';
import { useClaimableRewards } from '@/hooks/useClaimableRewards';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Gift, AlertCircle, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ClaimableReward } from '@/lib/rewards/claimableRewards';

const ClaimableRewardsCard = () => {
  const { user, updateUser } = useAuth();
  const { 
    claimableRewards, 
    allRewards,
    isLoading, 
    isClaiming, 
    countdowns,
    formatCountdown,
    loadRewards, 
    handleClaim 
  } = useClaimableRewards(user?.id);

  // Force a refresh when the component mounts
  useEffect(() => {
    if (user?.id) {
      console.log("ClaimableRewardsCard mounted, forcing initial rewards refresh");
      loadRewards();
    }
  }, [user?.id, loadRewards]);

  const claimReward = async (reward: ClaimableReward) => {
    if (!reward.id) return;
    
    const updatedUser = await handleClaim(reward.id);
    if (updatedUser) {
      updateUser(updatedUser);
    }
  };

  const handleRefresh = () => {
    console.log("Manually refreshing rewards");
    loadRewards();
  };

  // Group rewards by plan
  const rewardsByPlan: Record<string, ClaimableReward[]> = {};
  
  allRewards.forEach(reward => {
    if (!rewardsByPlan[reward.planId]) {
      rewardsByPlan[reward.planId] = [];
    }
    rewardsByPlan[reward.planId].push(reward);
  });

  console.log("Current user:", user?.id);
  console.log("All rewards:", allRewards);
  console.log("Rewards by plan:", rewardsByPlan);
  console.log("Current countdowns:", countdowns);
  console.log("Is loading:", isLoading);

  if (!user) return null;

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <CardHeader className="border-b border-gray-100 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center mr-4">
              <Gift className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-medium text-gray-900">Claimable USDT Rewards</CardTitle>
              <CardDescription className="text-sm text-gray-500">Claim your daily USDT earnings from premium plans</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="h-9 w-9"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-5">
        {isLoading ? (
          <div className="text-center py-6">
            <p className="text-gray-500">Loading rewards...</p>
          </div>
        ) : Object.keys(rewardsByPlan).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(rewardsByPlan).map(([planId, rewards]) => {
              // Find the first unclaimed reward for this plan
              const unclaimedReward = rewards.find(r => !r.claimed);
              const planName = rewards[0]?.planName || "Mining Plan";
              const dailyAmount = rewards[0]?.amount || 0;
              const countdown = countdowns[planId] || 0;
              const isClaimable = unclaimedReward && countdown <= 0;
              
              return (
                <div key={planId} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{planName}</h3>
                      <p className="text-sm text-gray-500">Daily reward: {formatCurrency(dailyAmount)}</p>
                    </div>
                    <div className="text-sm">
                      {countdown > 0 ? (
                        <div className="flex items-center text-amber-600">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{formatCountdown(countdown)}</span>
                        </div>
                      ) : isClaimable ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Ready to claim
                        </span>
                      ) : (
                        <span className="text-gray-500">No rewards available</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    {isClaimable ? (
                      <Button 
                        className="w-full"
                        onClick={() => claimReward(unclaimedReward)}
                        disabled={isClaiming}
                      >
                        {isClaiming ? 'Claiming...' : `Claim ${formatCurrency(unclaimedReward.amount)}`}
                      </Button>
                    ) : (
                      <Button className="w-full" disabled>
                        {countdown > 0 ? 'Next reward in ' + formatCountdown(countdown) : 'No rewards available'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 space-y-2">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto" />
            <p className="text-gray-500">No plans with claimable rewards</p>
            <p className="text-sm text-gray-400">Purchase a premium mining plan to earn USDT rewards</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-5 bg-gray-50 border-t border-gray-100">
        <div className="w-full text-xs text-gray-500">
          <div className="flex items-center mb-1">
            <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
            <span>New rewards are available every 24 hours after claiming</span>
          </div>
          <div className="flex items-center">
            <Gift className="h-3.5 w-3.5 mr-1 text-gray-400" />
            <span>Claim your rewards daily to maximize your earnings</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ClaimableRewardsCard;
