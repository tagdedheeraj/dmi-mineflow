import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users } from 'lucide-react';
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
} from '@/lib/rewards/referralCommissions';

// Import refactored components
import ReferralOverview from './ReferralOverview';
import ReferralNetworkTab from './ReferralNetworkTab';
import CommissionTab from './CommissionTab';
import ContestTab from './ContestTab';

interface ReferralStats {
  totalReferrals: number;
  level1Count: number;
  level2Count: number;
  totalEarnings: number;
}

interface CommissionBreakdown {
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
}

const ReferralSystem: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [referredUsers, setReferredUsers] = useState<any[]>([]);
  const [referralStats, setReferralStats] = useState<ReferralStats>({ 
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
  const [commissionBreakdown, setCommissionBreakdown] = useState<CommissionBreakdown>({
    level1: 0,
    level2: 0,
    level3: 0,
    level4: 0,
    level5: 0
  });
  const [isPremium, setIsPremium] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Function to refresh commission data
  const refreshCommissionData = useCallback(async (): Promise<void> => {
    if (!user?.id) return;
    
    console.log("Refreshing commission data...");
    
    try {
      const [history, total, breakdown] = await Promise.all([
        getCommissionHistory(user.id),
        getTotalCommissionEarned(user.id),
        getCommissionBreakdown(user.id)
      ]);
      
      setCommissionHistory(history);
      setTotalCommission(total);
      setCommissionBreakdown(breakdown as CommissionBreakdown);
      
      console.log("Commission data refreshed:", { totalCommission: total, breakdown });
    } catch (error) {
      console.error("Error refreshing commission data:", error);
    }
  }, [user?.id]);
  
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
      
      refreshCommissionData();
      
      hasPremiumPlan(user.id).then(result => {
        setIsPremium(result);
      });
    }
  }, [user, updateUser, refreshKey, refreshCommissionData]);
  
  useEffect(() => {
    if (!user?.id) return;
    
    const intervalId = setInterval(() => {
      refreshCommissionData();
    }, 30000); // 30 seconds
    
    return () => clearInterval(intervalId);
  }, [user?.id, refreshCommissionData]);
  
  const handleTabChange = (value: string): void => {
    setActiveTab(value);
    if (value === "commission") {
      refreshCommissionData();
    }
  };
  
  const copyReferralCode = (): void => {
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
        setRefreshKey(prev => prev + 1);
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
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="network">My Network</TabsTrigger>
            <TabsTrigger value="commission">Commissions</TabsTrigger>
            <TabsTrigger value="contest">Contest</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <ReferralOverview 
              isPremium={isPremium}
              referralCode={referralCode}
              referralStats={referralStats}
              totalCommission={totalCommission}
              inputCode={inputCode}
              setInputCode={setInputCode}
              isSubmitting={isSubmitting}
              referredUsers={referredUsers}
              user={user}
              handleApplyCode={handleApplyCode}
              refreshCommissionData={refreshCommissionData}
              copyReferralCode={copyReferralCode}
              shareReferralCode={shareReferralCode}
            />
          </TabsContent>
          
          <TabsContent value="network" className="space-y-4">
            <ReferralNetworkTab referralNetwork={referralNetwork} />
          </TabsContent>
          
          <TabsContent value="commission" className="space-y-4">
            <CommissionTab 
              totalCommission={totalCommission}
              commissionBreakdown={commissionBreakdown}
              commissionHistory={commissionHistory}
              refreshCommissionData={refreshCommissionData}
            />
          </TabsContent>
          
          <TabsContent value="contest" className="space-y-4">
            <ContestTab />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ReferralSystem;
