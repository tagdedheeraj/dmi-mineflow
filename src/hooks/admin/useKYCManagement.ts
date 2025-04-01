
import { useCallback } from 'react';
import { useKYCRequests } from './kyc/useKYCRequests';
import { useKYCSettings } from './kyc/useKYCSettings';
import { useKYCRequestDetail } from './kyc/useKYCRequestDetail';
import { useKYCProcessing } from './kyc/useKYCProcessing';

export const useKYCManagement = () => {
  const {
    isLoading: isLoadingRequests,
    kycRequests,
    statusFilter,
    setStatusFilter,
    loadKYCRequests,
  } = useKYCRequests();

  const {
    isLoading: isLoadingSettings,
    isKYCEnabled,
    toggleKYCEnabled,
  } = useKYCSettings();

  const {
    isLoading: isLoadingDetails,
    selectedRequest,
    setSelectedRequest,
    viewKYCDetails,
  } = useKYCRequestDetail();

  const {
    isLoading: isLoadingProcessing,
    handleApproveKYC,
    handleRejectKYC,
  } = useKYCProcessing(loadKYCRequests);

  // Combined loading state
  const isLoading = isLoadingRequests || isLoadingSettings || isLoadingDetails || isLoadingProcessing;

  return {
    isLoading,
    kycRequests,
    selectedRequest,
    statusFilter,
    isKYCEnabled,
    setStatusFilter,
    setSelectedRequest,
    loadKYCRequests,
    handleApproveKYC,
    handleRejectKYC,
    viewKYCDetails,
    toggleKYCEnabled,
  };
};
