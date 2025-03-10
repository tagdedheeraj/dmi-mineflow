import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Users, Copy, Gift, Trophy, Network, Share2, DollarSign, Badge, Layers } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  generateReferralCode, 
  saveReferralCode, 
  applyReferralCode, 
  getReferredUsers, 
  getReferralStats, 
  getReferralNetwork 
} from '@/lib/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReferralNetworkVisualization from './ReferralNetworkVisualization';
import ReferralLeaderboard from './ReferralLeaderboard';
import { 
  getCommissionHistory, 
  getTotalCommissionEarned, 
  getCommissionBreakdown,
  hasPremiumPlan,
  REFERRAL_COMMISSION_RATE_LEVEL1,
  REFERRAL_COMMISSION_RATE_LEVEL1_PREMIUM,
  REFERRAL_COMMISSION_RATE_LEVEL2,
  REFERRAL_COMMISSION_RATE_LEVEL3,
  REFERRAL_COMMISSION_RATE_LEVEL4,
  REFERRAL_COMMISSION_RATE_LEVEL5,
  REFERRAL_REWARD_COINS_LEVEL1,
  REFERRAL_REWARD_COINS_LEVEL1_PREMIUM,
  REFERRAL_REWARD_COINS_LEVEL2,
  REFERRAL_REWARD_COINS_LEVEL2_PREMIUM,
  REFERRAL_REWARD_COINS_LEVEL3,
  REFERRAL_REWARD_COINS_LEVEL3_PREMIUM,
  REFERRAL_REWARD_COINS_LEVEL4,
  REFERRAL_REWARD_COINS_LEVEL4_PREMIUM,
  REFERRAL_REWARD_COINS_LEVEL5,
  REFERRAL_REWARD_COINS_LEVEL5_PREMIUM,
  PREMIUM_PLAN_THRESHOLD
} from '@/lib/rewards/referralCommissions';

const ReferralSystem: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [referredUsers, setReferredUsers] = useState<any[]>([]);
  const [referralStats, setReferralStats] = useState<any>({ 
    totalReferrals: 0, 
    level1Count: 0, 
    level2Count: 0, 
    totalEarnings: 0 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [referralNetwork, setReferralNetwork] = useState<any[]>([]);
  const [commissionHistory, setCommissionHistory] = useState<any[]>([]);
  const [totalCommission, setTotalCommission] = useState(0);
  const [commissionBreakdown, setCommissionBreakdown] = useState<any>({
    level1: 0,
    level2: 0,
    level3: 0,
    level4: 0,
    level5: 0
  });
  const [isPremium, setIsPremium] = useState(false);
  
  useEffect(() => {
    if (user && !user.referralCode) {
      const code = generateReferralCode(user.id);
      setReferralCode(code);
      saveReferralCode(user.id, code).then(() => {
        updateUser({ ...user, referralCode: code });
      });
    } else if (user && user.referralCode) {
      setReferralCode(user.referralCode);
    }
    
    if (user) {
      getReferredUsers(user.id).then(users => {
        setReferredUsers(users);
      });
      
      getReferralStats(user.id).then(stats => {
        setReferralStats(stats);
      });
      
      getReferralNetwork(user.id).then(network => {
        setReferralNetwork(network);
      });
      
      const fetchCommissionData = async () => {
        try {
          const history = await getCommissionHistory(user.id);
          setCommissionHistory(history);
          
          const total = await getTotalCommissionEarned(user.id);
          setTotalCommission(total);
          
          const breakdown = await getCommissionBreakdown(user.id);
          setCommissionBreakdown(breakdown);
          
          console.log("[DEBUG] Fetched commission data:", { total, breakdown });
        } catch (error) {
          console.error("[DEBUG] Error fetching commission data:", error);
        }
      };
      
      fetchCommissionData();
      const refreshInterval = setInterval(fetchCommissionData, 30000);
      
      hasPremiumPlan(user.id).then(result => {
        setIsPremium(result);
      });
      
      return () => clearInterval(refreshInterval);
    }
  }, [user, updateUser]);
  
  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard.",
    });
  };
  
  const handleApplyCode = async () => {
    if (!inputCode) {
      toast({
        title: "Error",
        description: "Please enter a referral code.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await applyReferralCode(user?.id || '', inputCode);
      
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        
        if (user) {
          updateUser({ ...user, appliedReferralCode: inputCode });
        }
        
        setInputCode('');
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply referral code. Please try again.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };
  
  const shareReferralCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join DMI Network with my referral code',
          text: `Use my referral code ${referralCode} to join DMI Network and get 200 DMI coins bonus! Plus, I'll earn 5% of your plan earnings as commission!`,
          url: 'https://dminetwork.us'
        });
        toast({
          title: "Shared!",
          description: "Your referral code has been shared.",
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyReferralCode();
    }
  };
  
  const getRewardText = (level: number) => {
    if (level === 1) {
      return `${isPremium ? REFERRAL_REWARD_COINS_LEVEL1_PREMIUM : REFERRAL_REWARD_COINS_LEVEL1} DMI Coins + ${(isPremium ? REFERRAL_COMMISSION_RATE_LEVEL1_PREMIUM : REFERRAL_COMMISSION_RATE_LEVEL1) * 100}% Commission`;
    } else if (level === 2) {
      return `${isPremium ? REFERRAL_REWARD_COINS_LEVEL2_PREMIUM : REFERRAL_REWARD_COINS_LEVEL2} DMI Coins + ${REFERRAL_COMMISSION_RATE_LEVEL2 * 100}% Commission`;
    } else if (level === 3) {
      return `${isPremium ? REFERRAL_REWARD_COINS_LEVEL3_PREMIUM : REFERRAL_REWARD_COINS_LEVEL3} DMI Coins + ${REFERRAL_COMMISSION_RATE_LEVEL3 * 100}% Commission`;
    } else if (level === 4) {
      return `${isPremium ? REFERRAL_REWARD_COINS_LEVEL4_PREMIUM : REFERRAL_REWARD_COINS_LEVEL4} DMI Coins + ${REFERRAL_COMMISSION_RATE_LEVEL4 * 100}% Commission`;
    } else if (level === 5) {
      return `${isPremium ? REFERRAL_REWARD_COINS_LEVEL5_PREMIUM : REFERRAL_REWARD_COINS_LEVEL5} DMI Coins + ${REFERRAL_COMMISSION_RATE_LEVEL5 * 100}% Commission`;
    }
    return "";
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="p-4 border border-dmi/20 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-dmi">
            <Users className="h-5 w-5" />
            5-Level Referral System
          </h2>
          <div className="text-xs bg-dmi/10 text-dmi font-medium px-3 py-1 rounded-full">
            Earn up to 5 Levels Deep
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="network">My Network</TabsTrigger>
            <TabsTrigger value="commission">Commissions</TabsTrigger>
            <TabsTrigger value="contest">Contest</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div>
              {isPremium ? (
                <div className="bg-gradient-to-r from-amber-100 to-amber-200 p-3 rounded-lg flex items-center space-x-3 mb-4">
                  <div className="bg-amber-400 p-2 rounded-full">
                    <Badge className="h-5 w-5 text-amber-800" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-amber-800">Premium Referral Status Active</p>
                    <p className="text-xs text-amber-700">
                      You've unlocked premium referral rewards by purchasing a plan worth ${PREMIUM_PLAN_THRESHOLD}+
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 p-3 rounded-lg mb-4">
                  <p className="text-sm text-gray-600">
                    <Badge className="h-4 w-4 text-gray-500 inline mr-2" />
                    Upgrade to premium rewards by purchasing any plan worth ${PREMIUM_PLAN_THRESHOLD}+ to earn higher referral bonuses on all 5 levels!
                  </p>
                </div>
              )}
            
              <p className="text-sm text-gray-600 mb-4">
                Share your referral code and earn rewards across 5 levels! Each person who joins using your code earns you DMI coins and commission on their arbitrage plans. 
                Your rewards increase when you purchase a ${PREMIUM_PLAN_THRESHOLD}+ plan!
              </p>
              
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg mb-4">
                <h3 className="font-medium flex items-center text-dmi">
                  <Layers className="h-4 w-4 mr-2" />
                  Your Reward Structure
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <p className="text-xs font-semibold text-blue-700">Level 1</p>
                    <p className="text-xs text-blue-600">{getRewardText(1)}</p>
                  </div>
                  
                  <div className="bg-green-50 p-2 rounded-lg">
                    <p className="text-xs font-semibold text-green-700">Level 2</p>
                    <p className="text-xs text-green-600">{getRewardText(2)}</p>
                  </div>
                  
                  <div className="bg-purple-50 p-2 rounded-lg">
                    <p className="text-xs font-semibold text-purple-700">Level 3</p>
                    <p className="text-xs text-purple-600">{getRewardText(3)}</p>
                  </div>
                  
                  <div className="bg-orange-50 p-2 rounded-lg">
                    <p className="text-xs font-semibold text-orange-700">Level 4</p>
                    <p className="text-xs text-orange-600">{getRewardText(4)}</p>
                  </div>
                  
                  <div className="bg-indigo-50 p-2 rounded-lg md:col-span-2">
                    <p className="text-xs font-semibold text-indigo-700">Level 5</p>
                    <p className="text-xs text-indigo-600">{getRewardText(5)}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Referrals</p>
                    <p className="font-semibold text-lg">{referralStats.totalReferrals}</p>
                  </div>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Gift className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Earnings</p>
                    <p className="font-semibold text-lg">{referralStats.totalEarnings} DMI</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-lg flex items-center space-x-3 mb-6">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Commission Earnings</p>
                  <p className="font-semibold text-lg">{totalCommission.toFixed(2)} USDT</p>
                  <p className="text-xs text-gray-600">
                    You earn commissions on all 5 levels of your referral network
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <Label htmlFor="referral-code" className="text-sm font-medium mb-1.5 block">Your Referral Code</Label>
                <div className="flex items-center">
                  <Input 
                    id="referral-code"
                    value={referralCode} 
                    readOnly 
                    className="bg-gray-50 border-gray-200"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyReferralCode} 
                    className="ml-2 flex-shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={shareReferralCode} 
                    className="ml-2 flex-shrink-0"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {!user?.appliedReferralCode && (
                <div className="mb-4">
                  <Label htmlFor="apply-code" className="text-sm font-medium mb-1.5 block">Apply a Referral Code</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="apply-code"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="Enter friend's code"
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleApplyCode} 
                      disabled={isSubmitting}
                      className="flex-shrink-0"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}
              
              {user?.appliedReferralCode && (
                <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-md mb-4">
                  <Gift className="h-4 w-4 text-green-500 inline mr-2" />
                  You've already applied a referral code: <span className="font-medium">{user.appliedReferralCode}</span>
                </div>
              )}
              
              {referredUsers.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Your Direct Referrals ({referredUsers.length})</h3>
                  <div className="border rounded-md divide-y divide-gray-100 max-h-32 overflow-y-auto">
                    {referredUsers.map(user => (
                      <div key={user.id} className="p-2 text-xs flex justify-between items-center">
                        <span className="font-medium">{user.fullName}</span>
                        <span className="text-gray-500">
                          {user.timestamp && new Date(user.timestamp.toDate()).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="network" className="space-y-4">
            <h3 className="text-md font-medium">My Referral Network</h3>
            <p className="text-sm text-gray-600 mb-4">
              View your complete referral network below. 
              Your network can grow up to 5 levels deep, and you earn rewards for each level!
            </p>
            
            <div className="h-60 bg-gray-50 rounded-lg p-2 border border-gray-200">
              <ReferralNetworkVisualization network={referralNetwork} />
            </div>
          </TabsContent>
          
          <TabsContent value="commission" className="space-y-4">
            <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-lg">Referral Commissions</h3>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                Earn commission on all earnings from users in your 5-level referral network who purchase arbitrage plans.
              </p>
              <div className="text-sm bg-white bg-opacity-60 p-2 rounded text-gray-700">
                Total commissions earned: <span className="font-medium">{totalCommission.toFixed(2)} USDT</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="bg-blue-50 p-2 rounded-lg">
                <p className="text-xs text-gray-600">Level 1</p>
                <p className="font-medium">{commissionBreakdown.level1.toFixed(2)} USDT</p>
              </div>
              
              <div className="bg-green-50 p-2 rounded-lg">
                <p className="text-xs text-gray-600">Level 2</p>
                <p className="font-medium">{commissionBreakdown.level2.toFixed(2)} USDT</p>
              </div>
              
              <div className="bg-purple-50 p-2 rounded-lg">
                <p className="text-xs text-gray-600">Level 3</p>
                <p className="font-medium">{commissionBreakdown.level3.toFixed(2)} USDT</p>
              </div>
              
              <div className="bg-orange-50 p-2 rounded-lg">
                <p className="text-xs text-gray-600">Level 4</p>
                <p className="font-medium">{commissionBreakdown.level4.toFixed(2)} USDT</p>
              </div>
              
              <div className="bg-indigo-50 p-2 rounded-lg">
                <p className="text-xs text-gray-600">Level 5</p>
                <p className="font-medium">{commissionBreakdown.level5.toFixed(2)} USDT</p>
              </div>
              
              <div className="bg-yellow-50 p-2 rounded-lg">
                <p className="text-xs text-gray-600">Total</p>
                <p className="font-medium">{totalCommission.toFixed(2)} USDT</p>
              </div>
            </div>
            
            <h3 className="text-md font-medium">Commission History</h3>
            {commissionHistory.length === 0 ? (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">
                  No commissions earned yet. When your referred users earn from plans, you'll receive commission based on your level.
                </p>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <div className="grid grid-cols-5 bg-gray-50 p-2 text-xs font-medium text-gray-700">
                  <div>User</div>
                  <div>Amount</div>
                  <div>Level</div>
                  <div>Plan</div>
                  <div>Date</div>
                </div>
                <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                  {commissionHistory.map(commission => (
                    <div key={commission.id} className="grid grid-cols-5 p-2 text-xs">
                      <div className="truncate">{commission.referredId}</div>
                      <div className="font-medium">{commission.amount.toFixed(2)} USDT</div>
                      <div>Level {commission.level || 1}</div>
                      <div>{commission.planId}</div>
                      <div>{new Date(commission.timestamp).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="contest" className="space-y-4">
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-lg">Referral Contest</h3>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                Join our monthly referral contest! The user with the most referrals this month wins a special prize of 5000 DMI coins!
              </p>
              <div className="text-xs bg-white bg-opacity-60 p-2 rounded text-gray-700">
                Contest ends: <span className="font-medium">August 31, 2025</span>
              </div>
            </div>
            
            <ReferralLeaderboard />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ReferralSystem;
