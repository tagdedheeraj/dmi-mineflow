
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { KYCDocument } from '@/lib/firestore';
import KYCRequestsTable from './KYCRequestsTable';
import { AlertTriangle } from 'lucide-react';

interface KYCTabsProps {
  statusFilter: string;
  kycRequests: KYCDocument[];
  isLoading: boolean;
  onStatusFilterChange: (value: string) => void;
  onViewDetails: (kycId: string) => void;
  onApprove: (kycId: string) => void;
  onReject: (kycId: string) => void;
}

const KYCTabs: React.FC<KYCTabsProps> = ({
  statusFilter,
  kycRequests,
  isLoading,
  onStatusFilterChange,
  onViewDetails,
  onApprove,
  onReject
}) => {
  const pendingCount = kycRequests.filter(req => req.status === 'pending').length;

  return (
    <Tabs defaultValue="pending" onValueChange={onStatusFilterChange} value={statusFilter}>
      <TabsList className="mb-4">
        <TabsTrigger value="pending" className="relative">
          Pending
          {pendingCount > 0 && (
            <Badge
              className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px] bg-yellow-500"
            >
              {pendingCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="approved">Approved</TabsTrigger>
        <TabsTrigger value="rejected">Rejected</TabsTrigger>
        <TabsTrigger value="all">All Requests</TabsTrigger>
      </TabsList>
      
      <TabsContent value={statusFilter} className="space-y-4">
        <KYCRequestsTable
          isLoading={isLoading}
          kycRequests={kycRequests}
          onViewDetails={onViewDetails}
          onApprove={onApprove}
          onReject={onReject}
        />
      </TabsContent>
    </Tabs>
  );
};

export default KYCTabs;
