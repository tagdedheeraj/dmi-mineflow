
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, Coins } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useStakingManagement } from '@/hooks/admin/useStakingManagement';
import StakingTable from './staking/StakingTable';
import ManualStakingDialog from './staking/ManualStakingDialog';
import StakingSearch from './staking/StakingSearch';

const UserStakingManagement: React.FC = () => {
  const {
    filteredRecords,
    searchTerm,
    setSearchTerm,
    isLoading,
    actionSuccess,
    isDialogOpen,
    setIsDialogOpen,
    isSubmitting,
    form,
    fetchStakingRecords,
    calculateRemainingDays,
    onSubmitManualStaking
  } = useStakingManagement();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-semibold flex items-center">
          <Coins className="h-6 w-6 mr-2 text-purple-500" />
          User Staking Management
        </CardTitle>
        
        <ManualStakingDialog
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          form={form}
          onSubmit={onSubmitManualStaking}
          isSubmitting={isSubmitting}
        />
      </CardHeader>
      <CardContent>
        {actionSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Action Completed Successfully</AlertTitle>
            <AlertDescription className="text-green-700">
              The staking data has been updated.
            </AlertDescription>
          </Alert>
        )}
        
        <StakingSearch
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          onRefresh={fetchStakingRecords}
          isLoading={isLoading}
        />

        <StakingTable
          records={filteredRecords}
          calculateRemainingDays={calculateRemainingDays}
          isLoading={isLoading}
          searchTerm={searchTerm}
        />
      </CardContent>
    </Card>
  );
};

export default UserStakingManagement;
