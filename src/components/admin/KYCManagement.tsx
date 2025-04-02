
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Shield, RefreshCw } from 'lucide-react';
import { useKYCRequests } from '@/hooks/admin/kyc/useKYCRequests';
import { useKYCRequestDetail } from '@/hooks/admin/kyc/useKYCRequestDetail';
import { useKYCProcessing } from '@/hooks/admin/kyc/useKYCProcessing';
import { useKYCSettings } from '@/hooks/admin/kyc/useKYCSettings';

// Import the smaller component parts
import KYCSettings from './kyc/KYCSettings';
import KYCTabs from './kyc/KYCTabs';
import KYCDetailsDialog from './kyc/KYCDetailsDialog';
import RejectionDialog from './kyc/RejectionDialog';

const KYCManagement: React.FC = () => {
  // Get KYC requests data
  const {
    isLoading: isLoadingRequests,
    kycRequests,
    statusFilter,
    setStatusFilter,
    loadKYCRequests,
  } = useKYCRequests();

  // Get KYC settings
  const {
    isLoading: isLoadingSettings,
    isKYCEnabled,
    toggleKYCEnabled,
  } = useKYCSettings();

  // Request detail management
  const {
    isLoading: isLoadingDetails,
    selectedRequest,
    setSelectedRequest,
    viewKYCDetails,
  } = useKYCRequestDetail();

  // Processing functions
  const {
    isLoading: isLoadingProcessing,
    handleApproveKYC,
    handleRejectKYC,
  } = useKYCProcessing(loadKYCRequests);

  // Combined loading state
  const isLoading = isLoadingRequests || isLoadingSettings || isLoadingDetails || isLoadingProcessing;
  
  // State for rejection dialog
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  
  // Handle refresh button
  const handleRefresh = () => {
    loadKYCRequests();
  };
  
  // Handle reject confirmation
  const handleReject = () => {
    if (selectedRequest?.id) {
      handleRejectKYC(selectedRequest.id, rejectionReason)
        .then(success => {
          if (success) {
            setRejectionReason('');
            setShowRejectionDialog(false);
          }
        });
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm mb-8">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-2xl font-semibold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          KYC Verification Management
        </CardTitle>
        
        <div className="flex items-center space-x-4">
          <KYCSettings 
            isEnabled={isKYCEnabled}
            isLoading={isLoading}
            onToggle={toggleKYCEnabled}
          />
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <KYCTabs
          statusFilter={statusFilter}
          kycRequests={kycRequests}
          isLoading={isLoading}
          onStatusFilterChange={setStatusFilter}
          onViewDetails={viewKYCDetails}
          onApprove={handleApproveKYC}
          onReject={(kycId) => {
            viewKYCDetails(kycId);
            setShowRejectionDialog(true);
          }}
        />
      </CardContent>
      
      {/* KYC Details Dialog */}
      <KYCDetailsDialog
        kycRequest={selectedRequest}
        isOpen={!!selectedRequest && !showRejectionDialog}
        isLoading={isLoading}
        onClose={() => setSelectedRequest(null)}
        onApprove={handleApproveKYC}
        onShowRejectionDialog={() => setShowRejectionDialog(true)}
      />
      
      {/* Rejection Reason Dialog */}
      <RejectionDialog
        isOpen={showRejectionDialog}
        isLoading={isLoading}
        rejectionReason={rejectionReason}
        onRejectionReasonChange={setRejectionReason}
        onClose={() => setShowRejectionDialog(false)}
        onReject={handleReject}
      />
    </Card>
  );
};

export default KYCManagement;
