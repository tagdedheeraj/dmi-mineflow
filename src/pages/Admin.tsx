
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Admin layout
import AdminLayout from '@/components/admin/AdminLayout';

// Admin panel components
import AppSettingsPanel from '@/components/admin/AppSettingsPanel';
import AppFileManagement from '@/components/admin/AppFileManagement';
import PlanManagement from '@/components/admin/PlanManagement';
import UserManagement from '@/components/admin/UserManagement';
import TaskRewardsManagement from '@/components/admin/TaskRewardsManagement';
import AutomatedArbitragePlan from '@/components/admin/AutomatedArbitragePlan';
import UserCoinsManagement from '@/components/admin/UserCoinsManagement';
import CustomNotificationPanel from '@/components/admin/CustomNotificationPanel';
import WithdrawalRequestsManagement from '@/components/admin/WithdrawalRequestsManagement';
import UserPlanManagement from '@/components/admin/UserPlanManagement';
import UserStakingManagement from '@/components/admin/UserStakingManagement';
import DmiCoinValueManagement from '@/components/admin/DmiCoinValueManagement';
import KYCManagement from '@/components/admin/KYCManagement';

const Admin: React.FC = () => {
  const { appSettings } = useAuth();
  
  // Function to refresh settings after update
  const handleSettingsUpdated = () => {
    // Force a refresh of the page to apply new settings
    window.location.reload();
  };

  return (
    <AdminLayout>
      {/* App Settings Panel */}
      <AppSettingsPanel 
        currentVersion={appSettings.version}
        currentUpdateUrl={appSettings.updateUrl}
        showBadge={appSettings.showLovableBadge}
        onSettingsUpdated={handleSettingsUpdated}
      />
      
      {/* DMI Coin Value Management */}
      <DmiCoinValueManagement />
      
      {/* User Management Panel */}
      <UserManagement />
      
      {/* KYC Management */}
      <KYCManagement />
      
      {/* User Plan Management */}
      <UserPlanManagement />
      
      {/* User Staking Management */}
      <UserStakingManagement />
      
      {/* App File Management */}
      <AppFileManagement />
      
      {/* Plan Management Panel */}
      <PlanManagement />
      
      {/* Task Rewards Management Panel */}
      <TaskRewardsManagement />
      
      {/* Automated Arbitrage Plan */}
      <AutomatedArbitragePlan />
      
      {/* User Coins Management Panel */}
      <UserCoinsManagement />
      
      {/* Custom Notification Panel */}
      <CustomNotificationPanel />
      
      {/* Withdrawal Requests Management */}
      <WithdrawalRequestsManagement />
    </AdminLayout>
  );
};

export default Admin;
