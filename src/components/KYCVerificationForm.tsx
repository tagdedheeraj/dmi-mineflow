
import React from 'react';
import { useKYC } from '@/hooks/useKYC';
import KYCPendingStatus from './kyc/KYCPendingStatus';
import KYCApprovedStatus from './kyc/KYCApprovedStatus';
import KYCRejectedStatus from './kyc/KYCRejectedStatus';
import KYCForm from './kyc/KYCForm';

const KYCVerificationForm: React.FC = () => {
  const { isLoading, kycStatus, submitKYC } = useKYC();
  
  // Render based on KYC status
  if (kycStatus) {
    if (kycStatus.status === 'pending') {
      return <KYCPendingStatus kycStatus={kycStatus} />;
    } else if (kycStatus.status === 'approved') {
      return <KYCApprovedStatus kycStatus={kycStatus} />;
    } else if (kycStatus.status === 'rejected') {
      return <KYCRejectedStatus kycStatus={kycStatus} />;
    }
  }
  
  // KYC form for new submissions
  return <KYCForm isLoading={isLoading} onSubmit={submitKYC} />;
};

export default KYCVerificationForm;
