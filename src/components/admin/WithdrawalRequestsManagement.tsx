
import React, { useState, useEffect } from 'react';
import { WithdrawalRequest } from '@/lib/withdrawalTypes';
import { Dialog } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { 
  getAllWithdrawalRequests, 
  getPendingWithdrawalRequests,
  approveWithdrawalRequest,
  rejectWithdrawalRequest
} from '@/lib/withdrawals';
import SearchBar from './SearchBar';
import WithdrawalTabs from './WithdrawalTabs';
import RejectionDialog from './RejectionDialog';
import RejectionDetailsDialog from './RejectionDetailsDialog';

const WithdrawalRequestsManagement: React.FC = () => {
  const { user } = useAuth();
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const { toast } = useToast();

  // Load withdrawal requests
  const loadWithdrawalRequests = async () => {
    setIsLoading(true);
    console.log("Loading withdrawal requests...");
    try {
      const allRequests = await getAllWithdrawalRequests();
      console.log("All requests loaded:", allRequests.length);
      
      const pending = await getPendingWithdrawalRequests();
      console.log("Pending requests loaded:", pending.length);
      
      setWithdrawalRequests(allRequests);
      setPendingRequests(pending);
    } catch (error) {
      console.error("Error loading withdrawal requests:", error);
      toast({
        title: "Error",
        description: "Failed to load withdrawal requests.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawalRequests();
  }, []);

  useEffect(() => {
    if (selectedRequest) {
      setShowRejectionDialog(true);
    } else {
      setShowRejectionDialog(false);
    }
  }, [selectedRequest]);

  const handleApproveRequest = async (request: WithdrawalRequest) => {
    if (!user || !request.id) return;
    
    try {
      console.log(`Approving request ${request.id} for ${request.amount} USDT`);
      const success = await approveWithdrawalRequest(request.id, user.id);
      
      if (success) {
        toast({
          title: "Request Approved",
          description: `Withdrawal request for ${request.amount.toFixed(2)} USDT has been approved.`,
        });
        loadWithdrawalRequests(); // Refresh the list after approval
      } else {
        throw new Error("Failed to approve request.");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      toast({
        title: "Error",
        description: "Failed to approve withdrawal request.",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async () => {
    if (!user || !selectedRequest || !selectedRequest.id || !rejectionReason) {
      console.error("Cannot reject: missing data", { 
        userId: user?.id, 
        requestId: selectedRequest?.id,
        reason: rejectionReason 
      });
      return;
    }
    
    try {
      console.log(`Rejecting request ${selectedRequest.id} with reason: ${rejectionReason}`);
      const success = await rejectWithdrawalRequest(
        selectedRequest.id, 
        user.id, 
        rejectionReason
      );
      
      if (success) {
        toast({
          title: "Request Rejected",
          description: `Withdrawal request for ${selectedRequest.amount.toFixed(2)} USDT has been rejected.`,
        });
        setRejectionReason("");
        setSelectedRequest(null);
        setShowRejectionDialog(false);
        loadWithdrawalRequests(); // Refresh the list after rejection
      } else {
        throw new Error("Failed to reject request.");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description: "Failed to reject withdrawal request.",
        variant: "destructive",
      });
    }
  };

  // Filter requests based on search term
  const filteredRequests = (activeTab === "pending" ? pendingRequests : withdrawalRequests)
    .filter(request => 
      request.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.usdtAddress?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dmi"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-6">Withdrawal Requests Management</h2>
      
      <SearchBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onRefresh={loadWithdrawalRequests}
      />
      
      <WithdrawalTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingRequests={pendingRequests}
        filteredRequests={filteredRequests}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
        setSelectedRequest={setSelectedRequest}
      />
      
      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={(open) => {
        if (!open) {
          setSelectedRequest(null);
          setRejectionReason("");
        }
        setShowRejectionDialog(open);
      }}>
        <RejectionDialog 
          selectedRequest={selectedRequest}
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          onReject={handleRejectRequest}
        />
      </Dialog>
      
      {/* Rejection Details Dialog */}
      <Dialog>
        {activeTab === "all" && 
          filteredRequests
            .filter(request => request.status === 'rejected')
            .map(request => (
              <RejectionDetailsDialog key={request.id} request={request} />
            ))
        }
      </Dialog>
    </div>
  );
};

// Add missing import for useAuth
import { useAuth } from '@/contexts/AuthContext';

export default WithdrawalRequestsManagement;
