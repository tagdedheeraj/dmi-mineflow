
import React, { useState, useEffect } from 'react';
import { useKYC } from '@/hooks/useKYC';
import KYCPendingStatus from './kyc/KYCPendingStatus';
import KYCApprovedStatus from './kyc/KYCApprovedStatus';
import KYCRejectedStatus from './kyc/KYCRejectedStatus';
import KYCForm from './kyc/KYCForm';
import { KYCDocument } from '@/lib/firestore/kyc';

const KYCVerificationForm: React.FC = () => {
  const { isLoading, kycStatus, submitKYC, loadKycStatus } = useKYC();
  const [resubmitting, setResubmitting] = useState(false);
  const [submissionInProgress, setSubmissionInProgress] = useState(false);
  
  // Load KYC status once on mount and every 30 seconds to check for status updates
  useEffect(() => {
    loadKycStatus();
    
    // Set up polling to check for status updates from admin
    const intervalId = setInterval(() => {
      loadKycStatus();
    }, 30000); // Check every 30 seconds
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [loadKycStatus]);
  
  // Handle resetting/resubmitting KYC after rejection
  const handleResubmit = () => {
    setResubmitting(true);
  };

  // Wrap the submitKYC function to handle the local state changes
  const handleSubmitKYC = async (formData: any) => {
    setSubmissionInProgress(true);
    const success = await submitKYC(formData);
    if (success) {
      // Reload the KYC status after successful submission
      await loadKycStatus();
    }
    setSubmissionInProgress(false);
    return success;
  };
  
  // Show loading state
  if (isLoading && !kycStatus && !resubmitting && !submissionInProgress) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Show pending status when KYC is pending OR when submission was just completed
  if ((kycStatus && kycStatus.status === 'pending') || submissionInProgress) {
    // Make sure we pass the correct type to KYCPendingStatus
    const pendingData = kycStatus && kycStatus.status === 'pending' 
      ? kycStatus as Partial<KYCDocument> & { status: 'pending' }
      : { status: 'pending' as const } as Partial<KYCDocument> & { status: 'pending' };
    
    return <KYCPendingStatus kycStatus={pendingData} />;
  }
  
  // Render based on KYC status
  if (kycStatus && !resubmitting && !submissionInProgress) {
    // Make sure we're correctly checking the status
    if (kycStatus.status === 'approved') {
      return <KYCApprovedStatus kycStatus={kycStatus} />;
    } else if (kycStatus.status === 'rejected') {
      return <KYCRejectedStatus kycStatus={kycStatus} onReset={handleResubmit} />;
    }
  }
  
  // KYC form for new submissions or resubmission
  return <KYCForm isLoading={isLoading} onSubmit={handleSubmitKYC} />;
};

export default KYCVerificationForm;
