
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Users, Copy, Gift, Trophy, Network, Share2, DollarSign, Badge, Layers, User, Coins } from 'lucide-react';
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
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

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
      
      // Fetch commission data
      getCommissionHistory(user.id).then(history => {
        setCommissionHistory(history);
      });
      
      getTotalCommissionEarned(user.id).then(total => {
        setTotalCommission(total);
      });
      
      getCommissionBreakdown(user.id).then(breakdown => {
        setCommissionBreakdown(breakdown);
      });
      
      // Check if user has premium plan
      hasPremiumPlan(user.id).then(result => {
        setIsPremium(result);
      });
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
      <Card className="border border-dmi/20 bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-dmi/5 to-dmi/10 p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-dmi">
              <Users className="h-5 w-5" />
              5-Level Referral System
            </h2>
            <div className="text-xs bg-dmi/10 text-dmi font-medium px-3 py-1 rounded-full">
              Earn up to 5 Levels Deep
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 p-1 px-4 bg-gray-50 border-b">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <div className="flex items-center gap-1.5">
                <Layers className="h-4 w-4" />
                <span>Overview</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="network" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>My Network</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="commission" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" />
                <span>Commissions</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="contest" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <div className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4" />
                <span>Contest</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="p-4 space-y-4">
            {/* Premium Status */}
            {isPremium ? (
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-3 rounded-lg flex items-center space-x-3 mb-4">
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
              <div className="bg-gray-50 p-3 rounded-lg mb-4 border border-gray-100">
                <p className="text-sm text-gray-600 flex items-center">
                  <Badge className="h-4 w-4 text-gray-500 mr-2" />
                  Upgrade to premium rewards by purchasing any plan worth ${PREMIUM_PLAN_THRESHOLD}+ to earn higher referral bonuses on all 5 levels!
                </p>
              </div>
            )}
            
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg flex items-center space-x-4 border border-blue-100 shadow-sm">
                <div className="bg-blue-50 p-3 rounded-full">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Referrals</p>
                  <p className="font-semibold text-xl">{referralStats.totalReferrals}</p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg flex items-center space-x-4 border border-green-100 shadow-sm">
                <div className="bg-green-50 p-3 rounded-full">
                  <Gift className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Earnings</p>
                  <p className="font-semibold text-xl">{referralStats.totalEarnings} DMI</p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg flex items-center space-x-4 border border-yellow-100 shadow-sm">
                <div className="bg-yellow-50 p-3 rounded-full">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Commission Earnings</p>
                  <p className="font-semibold text-xl">{totalCommission.toFixed(2)} USDT</p>
                </div>
              </div>
            </div>
            
            {/* Referral Code Section */}
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm mb-4">
              <Label htmlFor="referral-code" className="text-sm font-medium mb-2 block text-gray-700">Your Referral Code</Label>
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
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={shareReferralCode} 
                  className="ml-2 flex-shrink-0"
                >
                  <Share2 className="h-4 w-4 mr-1" /> Share
                </Button>
              </div>
              
              {!user?.appliedReferralCode ? (
                <div className="mt-4">
                  <Label htmlFor="apply-code" className="text-sm font-medium mb-2 block text-gray-700">Apply a Referral Code</Label>
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
              ) : (
                <div className="mt-3 text-sm text-gray-600 bg-green-50 p-3 rounded-md">
                  <Gift className="h-4 w-4 text-green-500 inline mr-2" />
                  You've already applied a referral code: <span className="font-medium">{user.appliedReferralCode}</span>
                </div>
              )}
            </div>
            
            {/* Reward Structure */}
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <h3 className="font-medium flex items-center text-dmi mb-3">
                <Layers className="h-4 w-4 mr-2" />
                Your Reward Structure
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg">
                  <div className="flex items-center mb-1">
                    <div className="bg-blue-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-blue-700">1</div>
                    <p className="ml-2 text-sm font-semibold text-blue-700">Level 1</p>
                  </div>
                  <p className="text-xs text-blue-600 pl-7">{getRewardText(1)}</p>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg">
                  <div className="flex items-center mb-1">
                    <div className="bg-green-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-green-700">2</div>
                    <p className="ml-2 text-sm font-semibold text-green-700">Level 2</p>
                  </div>
                  <p className="text-xs text-green-600 pl-7">{getRewardText(2)}</p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-lg">
                  <div className="flex items-center mb-1">
                    <div className="bg-purple-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-purple-700">3</div>
                    <p className="ml-2 text-sm font-semibold text-purple-700">Level 3</p>
                  </div>
                  <p className="text-xs text-purple-600 pl-7">{getRewardText(3)}</p>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-3 rounded-lg">
                  <div className="flex items-center mb-1">
                    <div className="bg-orange-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-orange-700">4</div>
                    <p className="ml-2 text-sm font-semibold text-orange-700">Level 4</p>
                  </div>
                  <p className="text-xs text-orange-600 pl-7">{getRewardText(4)}</p>
                </div>
                
                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-3 rounded-lg md:col-span-2">
                  <div className="flex items-center mb-1">
                    <div className="bg-indigo-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-indigo-700">5</div>
                    <p className="ml-2 text-sm font-semibold text-indigo-700">Level 5</p>
                  </div>
                  <p className="text-xs text-indigo-600 pl-7">{getRewardText(5)}</p>
                </div>
              </div>
            </div>
            
            {/* Direct Referrals */}
            {referredUsers.length > 0 && (
              <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Your Direct Referrals ({referredUsers.length})
                </h3>
                <div className="border rounded-md overflow-hidden">
                  <div className="grid grid-cols-2 bg-gray-50 p-2 text-xs font-medium text-gray-700 border-b">
                    <div>User</div>
                    <div>Date Joined</div>
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    {referredUsers.map(user => (
                      <div key={user.id} className="grid grid-cols-2 p-2 text-xs border-b last:border-0">
                        <span className="font-medium">{user.fullName}</span>
                        <span className="text-gray-500">
                          {user.timestamp && new Date(user.timestamp.toDate()).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="network" className="p-4 space-y-4">
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm mb-4">
              <h3 className="text-md font-medium flex items-center text-gray-700 mb-2">
                <Network className="h-5 w-5 mr-2 text-dmi" />
                My Referral Network
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                View your complete referral network below. 
                Your network can grow up to 5 levels deep, and you earn rewards for each level!
              </p>
              
              <div className="h-60 bg-gray-50 rounded-lg p-2 border border-gray-200 overflow-hidden">
                <ReferralNetworkVisualization network={referralNetwork} />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-medium text-gray-700">Network Statistics</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {referralStats.totalReferrals} Total Users
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Level 1</p>
                  <p className="font-medium text-blue-700">{referralStats.level1Count || 0}</p>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Level 2</p>
                  <p className="font-medium text-green-700">{referralStats.level2Count || 0}</p>
                </div>
                
                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Level 3</p>
                  <p className="font-medium text-purple-700">{referralStats.level3Count || 0}</p>
                </div>
                
                <div className="bg-orange-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Level 4</p>
                  <p className="font-medium text-orange-700">{referralStats.level4Count || 0}</p>
                </div>
                
                <div className="bg-indigo-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Level 5</p>
                  <p className="font-medium text-indigo-700">{referralStats.level5Count || 0}</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="commission" className="p-4 space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-gray-100 shadow-sm mb-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-lg text-gray-800">Referral Commissions</h3>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                Earn commission on all earnings from users in your 5-level referral network who purchase arbitrage plans.
              </p>
              <div className="flex items-center justify-between px-4 py-3 bg-white rounded-lg">
                <span className="text-sm text-gray-600">Total commissions earned:</span>
                <span className="font-medium text-lg text-green-600">{totalCommission.toFixed(2)} USDT</span>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm mb-4">
              <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                <Coins className="h-5 w-5 mr-2 text-amber-500" />
                Commission Breakdown by Level
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                <div className="relative overflow-hidden bg-white border border-blue-100 rounded-lg p-3">
                  <div className="absolute inset-0 bg-blue-50 opacity-50"></div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-1">
                      <div className="bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-blue-700">1</div>
                      <p className="ml-2 text-sm font-semibold text-blue-700">Level 1</p>
                    </div>
                    <p className="font-medium text-lg text-blue-800">{commissionBreakdown.level1.toFixed(2)} USDT</p>
                    <p className="text-xs text-blue-600">{(isPremium ? REFERRAL_COMMISSION_RATE_LEVEL1_PREMIUM : REFERRAL_COMMISSION_RATE_LEVEL1) * 100}% rate</p>
                  </div>
                </div>
                
                <div className="relative overflow-hidden bg-white border border-green-100 rounded-lg p-3">
                  <div className="absolute inset-0 bg-green-50 opacity-50"></div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-1">
                      <div className="bg-green-100 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-green-700">2</div>
                      <p className="ml-2 text-sm font-semibold text-green-700">Level 2</p>
                    </div>
                    <p className="font-medium text-lg text-green-800">{commissionBreakdown.level2.toFixed(2)} USDT</p>
                    <p className="text-xs text-green-600">{REFERRAL_COMMISSION_RATE_LEVEL2 * 100}% rate</p>
                  </div>
                </div>
                
                <div className="relative overflow-hidden bg-white border border-purple-100 rounded-lg p-3">
                  <div className="absolute inset-0 bg-purple-50 opacity-50"></div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-1">
                      <div className="bg-purple-100 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-purple-700">3</div>
                      <p className="ml-2 text-sm font-semibold text-purple-700">Level 3</p>
                    </div>
                    <p className="font-medium text-lg text-purple-800">{commissionBreakdown.level3.toFixed(2)} USDT</p>
                    <p className="text-xs text-purple-600">{REFERRAL_COMMISSION_RATE_LEVEL3 * 100}% rate</p>
                  </div>
                </div>
                
                <div className="relative overflow-hidden bg-white border border-orange-100 rounded-lg p-3">
                  <div className="absolute inset-0 bg-orange-50 opacity-50"></div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-1">
                      <div className="bg-orange-100 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-orange-700">4</div>
                      <p className="ml-2 text-sm font-semibold text-orange-700">Level 4</p>
                    </div>
                    <p className="font-medium text-lg text-orange-800">{commissionBreakdown.level4.toFixed(2)} USDT</p>
                    <p className="text-xs text-orange-600">{REFERRAL_COMMISSION_RATE_LEVEL4 * 100}% rate</p>
                  </div>
                </div>
                
                <div className="relative overflow-hidden bg-white border border-indigo-100 rounded-lg p-3">
                  <div className="absolute inset-0 bg-indigo-50 opacity-50"></div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-1">
                      <div className="bg-indigo-100 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-indigo-700">5</div>
                      <p className="ml-2 text-sm font-semibold text-indigo-700">Level 5</p>
                    </div>
                    <p className="font-medium text-lg text-indigo-800">{commissionBreakdown.level5.toFixed(2)} USDT</p>
                    <p className="text-xs text-indigo-600">{REFERRAL_COMMISSION_RATE_LEVEL5 * 100}% rate</p>
                  </div>
                </div>
                
                <div className="relative overflow-hidden bg-white border border-yellow-100 rounded-lg p-3">
                  <div className="absolute inset-0 bg-yellow-50 opacity-50"></div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-1">
                      <div className="bg-yellow-100 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-yellow-700">
                        <DollarSign className="h-3 w-3" />
                      </div>
                      <p className="ml-2 text-sm font-semibold text-yellow-700">Total</p>
                    </div>
                    <p className="font-medium text-lg text-yellow-800">{totalCommission.toFixed(2)} USDT</p>
                    <p className="text-xs text-yellow-600">All levels combined</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <h3 className="text-md font-medium text-gray-700 mb-3">Commission History</h3>
              
              {commissionHistory.length === 0 ? (
                <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <DollarSign className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 font-medium">No commissions yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    When your referred users earn from plans, you'll receive commission based on your level.
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs font-medium">User</TableHead>
                        <TableHead className="text-xs font-medium">Amount</TableHead>
                        <TableHead className="text-xs font-medium">Level</TableHead>
                        <TableHead className="text-xs font-medium">Plan</TableHead>
                        <TableHead className="text-xs font-medium">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissionHistory.map(commission => (
                        <TableRow key={commission.id}>
                          <TableCell className="text-xs truncate">{commission.referredId}</TableCell>
                          <TableCell className="text-xs font-medium">{commission.amount.toFixed(2)} USDT</TableCell>
                          <TableCell className="text-xs">Level {commission.level || 1}</TableCell>
                          <TableCell className="text-xs">{commission.planId}</TableCell>
                          <TableCell className="text-xs">{new Date(commission.timestamp).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="contest" className="p-4 space-y-4">
            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-4 rounded-lg border border-gray-100 shadow-sm mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <h3 className="font-semibold text-lg text-gray-800">Monthly Referral Contest</h3>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                Join our monthly referral contest! The user with the most referrals this month wins a special prize of 5000 DMI coins!
              </p>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="bg-white bg-opacity-70 p-3 rounded-lg flex-1">
                  <p className="text-xs text-gray-500">Contest ends in:</p>
                  <p className="font-medium text-indigo-900">159 days</p>
                </div>
                
                <div className="bg-white bg-opacity-70 p-3 rounded-lg flex-1">
                  <p className="text-xs text-gray-500">Your position:</p>
                  <p className="font-medium text-indigo-900">#76</p>
                </div>
                
                <div className="bg-white bg-opacity-70 p-3 rounded-lg flex-1">
                  <p className="text-xs text-gray-500">Prize pool:</p>
                  <p className="font-medium text-indigo-900">5000 DMI</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                Leaderboard
              </h3>
              
              <ReferralLeaderboard />
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ReferralSystem;
