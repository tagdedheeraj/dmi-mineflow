
import React, { useState, useEffect } from 'react';
import { useKYC } from '@/hooks/useKYC';
import KYCPendingStatus from './kyc/KYCPendingStatus';
import KYCApprovedStatus from './kyc/KYCApprovedStatus';
import KYCRejectedStatus from './kyc/KYCRejectedStatus';
import KYCForm from './kyc/KYCForm';

const KYCVerificationForm: React.FC = () => {
  const { isLoading, kycStatus, submitKYC, loadKycStatus } = useKYC();
  const [resubmitting, setResubmitting] = useState(false);
  
  // Load KYC status once on mount
  useEffect(() => {
    loadKycStatus();
    // No dependency array to avoid re-running
  }, []);
  
  // Handle resetting/resubmitting KYC after rejection
  const handleResubmit = () => {
    setResubmitting(true);
  };
  
  // Show loading state
  if (isLoading && !kycStatus && !resubmitting) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Render based on KYC status
  if (kycStatus && !resubmitting) {
    if (kycStatus.status === 'pending') {
      return <KYCPendingStatus kycStatus={kycStatus} />;
    } else if (kycStatus.status === 'approved') {
      return <KYCApprovedStatus kycStatus={kycStatus} />;
    } else if (kycStatus.status === 'rejected') {
      return <KYCRejectedStatus kycStatus={kycStatus} onReset={handleResubmit} />;
    }
  }
  
  // KYC form for new submissions or resubmission
  return <KYCForm isLoading={isLoading} onSubmit={submitKYC} />;
};

export default KYCVerificationForm;
