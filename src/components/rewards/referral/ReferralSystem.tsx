
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  generateReferralCode, 
  saveReferralCode, 
  applyReferralCode, 
  getReferredUsers, 
  getReferralStats, 
  getReferralNetwork 
} from '@/lib/firestore';
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
  REFERRAL_REWARD_COINS_LEVEL5_PREMIUM
} from '@/lib/rewards/referralCommissions';

// Import the refactored tab components
import ReferralOverview from './ReferralOverview';
import NetworkTab from './NetworkTab';
import CommissionTab from './CommissionTab';
import ContestTab from './ContestTab';

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
    level3Count: 0,
    level4Count: 0,
    level5Count: 0,
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
          
          <TabsContent value="overview">
            <ReferralOverview 
              isPremium={isPremium}
              referralCode={referralCode}
              referralStats={referralStats}
              totalCommission={totalCommission}
              inputCode={inputCode}
              setInputCode={setInputCode}
              user={user}
              isSubmitting={isSubmitting}
              handleApplyCode={handleApplyCode}
              copyReferralCode={copyReferralCode}
              shareReferralCode={shareReferralCode}
              getRewardText={getRewardText}
              referredUsers={referredUsers}
            />
          </TabsContent>
          
          <TabsContent value="network">
            <NetworkTab 
              referralNetwork={referralNetwork}
              referralStats={referralStats}
            />
          </TabsContent>
          
          <TabsContent value="commission">
            <CommissionTab 
              totalCommission={totalCommission}
              commissionBreakdown={commissionBreakdown}
              commissionHistory={commissionHistory}
              isPremium={isPremium}
            />
          </TabsContent>
          
          <TabsContent value="contest">
            <ContestTab />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ReferralSystem;
