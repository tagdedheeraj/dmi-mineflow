
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DailyLeaderboard from './DailyLeaderboard';
import ReferralLeaderboard from '../rewards/ReferralLeaderboard';

const LeaderboardTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('daily');
  
  return (
    <Tabs defaultValue="daily" onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="daily">Daily Miners</TabsTrigger>
        <TabsTrigger value="referral">Referral Leaders</TabsTrigger>
      </TabsList>
      
      <TabsContent value="daily" className="mt-4">
        <DailyLeaderboard />
      </TabsContent>
      
      <TabsContent value="referral" className="mt-4">
        <ReferralLeaderboard />
      </TabsContent>
    </Tabs>
  );
};

export default LeaderboardTabs;
