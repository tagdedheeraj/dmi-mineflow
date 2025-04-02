
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import KYCRequestsTable from './KYCRequestsTable';
import { KYCDocument } from '@/lib/firestore/kyc';

interface KYCTabsProps {
  statusFilter: string;
  kycRequests: KYCDocument[];
  isLoading: boolean;
  onStatusFilterChange: (status: string) => void;
  onViewDetails: (kycId: string) => void;
  onApprove: (kycId: string) => void;
  onReject: (kycId: string) => void;
  onReset: (kycId: string) => void;
}

const KYCTabs: React.FC<KYCTabsProps> = ({
  statusFilter,
  kycRequests,
  isLoading,
  onStatusFilterChange,
  onViewDetails,
  onApprove,
  onReject,
  onReset
}) => {
  return (
    <Tabs
      defaultValue={statusFilter}
      onValueChange={onStatusFilterChange}
      className="w-full"
    >
      <TabsList className="mb-4">
        <TabsTrigger value="pending">Pending Verification</TabsTrigger>
        <TabsTrigger value="approved">Approved</TabsTrigger>
        <TabsTrigger value="rejected">Rejected</TabsTrigger>
        <TabsTrigger value="all">All Requests</TabsTrigger>
      </TabsList>
      
      <TabsContent value="pending" className="mt-0">
        <KYCRequestsTable
          isLoading={isLoading}
          kycRequests={kycRequests}
          onViewDetails={onViewDetails}
          onApprove={onApprove}
          onReject={onReject}
          onReset={onReset}
        />
      </TabsContent>
      
      <TabsContent value="approved" className="mt-0">
        <KYCRequestsTable
          isLoading={isLoading}
          kycRequests={kycRequests}
          onViewDetails={onViewDetails}
          onApprove={onApprove}
          onReject={onReject}
          onReset={onReset}
        />
      </TabsContent>
      
      <TabsContent value="rejected" className="mt-0">
        <KYCRequestsTable
          isLoading={isLoading}
          kycRequests={kycRequests}
          onViewDetails={onViewDetails}
          onApprove={onApprove}
          onReject={onReject}
          onReset={onReset}
        />
      </TabsContent>
      
      <TabsContent value="all" className="mt-0">
        <KYCRequestsTable
          isLoading={isLoading}
          kycRequests={kycRequests}
          onViewDetails={onViewDetails}
          onApprove={onApprove}
          onReject={onReject}
          onReset={onReset}
        />
      </TabsContent>
    </Tabs>
  );
};

export default KYCTabs;
