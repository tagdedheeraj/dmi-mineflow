
import React from 'react';
import { Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import the custom hook and tab components
import useReferralSystem from './hooks/useReferralSystem';
import OverviewTab from './tabs/OverviewTab';
import NetworkTab from './tabs/NetworkTab';
import CommissionTab from './tabs/CommissionTab';
import ContestTab from './tabs/ContestTab';

const ReferralSystem: React.FC = () => {
  const {
    user,
    updateUser,
    referralCode,
    inputCode,
    setInputCode,
    referredUsers,
    referralStats,
    isSubmitting,
    setIsSubmitting,
    activeTab,
    setActiveTab,
    referralNetwork,
    commissionHistory,
    totalCommission,
    commissionBreakdown,
    isPremium
  } = useReferralSystem();
  
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
          
          <TabsContent value="overview">
            <OverviewTab 
              user={user}
              referralCode={referralCode}
              inputCode={inputCode}
              setInputCode={setInputCode}
              referredUsers={referredUsers}
              referralStats={referralStats}
              totalCommission={totalCommission}
              isPremium={isPremium}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
              updateUser={updateUser}
            />
          </TabsContent>
          
          <TabsContent value="network">
            <NetworkTab 
              referralNetwork={referralNetwork}
            />
          </TabsContent>
          
          <TabsContent value="commission">
            <CommissionTab 
              commissionBreakdown={commissionBreakdown}
              totalCommission={totalCommission}
              commissionHistory={commissionHistory}
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
