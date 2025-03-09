
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { WithdrawalRequest } from '@/lib/withdrawalTypes';
import { 
  getAllWithdrawalRequests, 
  getPendingWithdrawalRequests,
  approveWithdrawalRequest,
  rejectWithdrawalRequest
} from '@/lib/withdrawals';
import { Dialog } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';

// Admin components
import AdminHeader from '@/components/admin/AdminHeader';
import SearchBar from '@/components/admin/SearchBar';
import WithdrawalTabs from '@/components/admin/WithdrawalTabs';
import RejectionDialog from '@/components/admin/RejectionDialog';
import RejectionDetailsDialog from '@/components/admin/RejectionDetailsDialog';
import AppSettingsPanel from '@/components/admin/AppSettingsPanel';
import CustomNotificationPanel from '@/components/admin/CustomNotificationPanel';
import UserCoinsManagement from '@/components/admin/UserCoinsManagement';
import UserManagement from '@/components/admin/UserManagement';
import PlanManagement from '@/components/admin/PlanManagement';

const Admin: React.FC = () => {
  const { user, isAdmin, signOut, appSettings } = useAuth();
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/signin');
    }
  }, [user, isAdmin, isLoading, navigate]);

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
    if (!user || !selectedRequest || !selectedRequest.id || !rejectionReason) return;
    
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dmi"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Admin Header */}
      <AdminHeader user={user} signOut={signOut} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* App Settings Panel */}
        <AppSettingsPanel 
          currentVersion={appSettings.version}
          currentUpdateUrl={appSettings.updateUrl}
          onSettingsUpdated={loadWithdrawalRequests}
        />
        
        {/* Plan Management Panel */}
        <PlanManagement />
        
        {/* User Management Panel */}
        <UserManagement />
        
        {/* User Coins Management Panel */}
        <UserCoinsManagement />
        
        {/* Custom Notification Panel */}
        <CustomNotificationPanel />
        
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
          <Dialog>
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
      </main>
    </div>
  );
};

export default Admin;
