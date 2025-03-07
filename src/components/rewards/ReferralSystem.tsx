
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Users, Copy, Gift, Trophy, Network, Share2 } from 'lucide-react';
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
  
  useEffect(() => {
    // Generate referral code if user doesn't have one
    if (user && !user.referralCode) {
      const code = generateReferralCode(user.id);
      setReferralCode(code);
      saveReferralCode(user.id, code).then(() => {
        updateUser({ ...user, referralCode: code });
      });
    } else if (user && user.referralCode) {
      setReferralCode(user.referralCode);
    }
    
    // Load referred users and stats
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
        
        // Update user object
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
          text: `Use my referral code ${referralCode} to join DMI Network and get 200 DMI coins bonus!`,
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
  
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="p-4 border border-dmi/20 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-dmi">
            <Users className="h-5 w-5" />
            Multi-Level Referral System
          </h2>
          <div className="text-xs bg-dmi/10 text-dmi font-medium px-3 py-1 rounded-full">
            Earn up to 500 DMI Coins
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="network">My Network</TabsTrigger>
            <TabsTrigger value="contest">Contest</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Share your referral code with friends and earn rewards for each person who joins using your code! 
                Multi-level rewards: Level 1 referrals earn you 200 DMI coins, and when your referrals invite others (Level 2), you earn an additional 50 DMI coins!
              </p>
              
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-purple-50 p-3 rounded-lg flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Level 1 Referrals</p>
                    <p className="font-semibold text-lg">{referralStats.level1Count}</p>
                  </div>
                </div>
                
                <div className="bg-orange-50 p-3 rounded-lg flex items-center space-x-3">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Network className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Level 2 Referrals</p>
                    <p className="font-semibold text-lg">{referralStats.level2Count}</p>
                  </div>
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
              Level 1 referrals earn you 200 DMI coins. 
              Level 2 referrals earn you an additional 50 DMI coins.
            </p>
            
            <div className="h-60 bg-gray-50 rounded-lg p-2 border border-gray-200">
              <ReferralNetworkVisualization network={referralNetwork} />
            </div>
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
                Contest ends: <span className="font-medium">August 31, 2023</span>
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
