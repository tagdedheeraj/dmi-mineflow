
import React from 'react';
import { WithdrawalRequest } from '@/lib/withdrawalTypes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Filter } from 'lucide-react';
import PendingRequestsTable from './PendingRequestsTable';
import AllRequestsTable from './AllRequestsTable';

interface WithdrawalTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingRequests: WithdrawalRequest[];
  filteredRequests: WithdrawalRequest[];
  onApprove: (request: WithdrawalRequest) => void;
  onReject: (request: WithdrawalRequest) => void;
  setSelectedRequest: (request: WithdrawalRequest | null) => void;
}

const WithdrawalTabs: React.FC<WithdrawalTabsProps> = ({
  activeTab,
  setActiveTab,
  pendingRequests,
  filteredRequests,
  onApprove,
  onReject,
  setSelectedRequest,
}) => {
  return (
    <Tabs defaultValue="pending" onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="pending" className="flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Pending
          {pendingRequests.length > 0 && (
            <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {pendingRequests.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="all" className="flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          All Requests
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="pending">
        <PendingRequestsTable 
          filteredRequests={filteredRequests} 
          onApprove={onApprove}
          onReject={onReject}
          setSelectedRequest={setSelectedRequest}
        />
      </TabsContent>
      
      <TabsContent value="all">
        <AllRequestsTable filteredRequests={filteredRequests} />
      </TabsContent>
    </Tabs>
  );
};

export default WithdrawalTabs;
