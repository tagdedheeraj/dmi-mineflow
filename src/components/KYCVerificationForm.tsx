
import React from 'react';
import { useKYC } from '@/hooks/useKYC';
import KYCPendingStatus from './kyc/KYCPendingStatus';
import KYCApprovedStatus from './kyc/KYCApprovedStatus';
import KYCRejectedStatus from './kyc/KYCRejectedStatus';
import KYCForm from './kyc/KYCForm';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const KYCVerificationForm: React.FC = () => {
  const { isLoading, kycStatus, submitKYC } = useKYC();
  
  // If we're still loading data, show a loading indicator
  if (isLoading && !kycStatus) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
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
  return (
    <>
      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <AlertTitle>KYC Verification Required</AlertTitle>
        <AlertDescription>
          Please complete the verification process below. Once submitted, your application will be reviewed by our team.
        </AlertDescription>
      </Alert>
      <KYCForm isLoading={isLoading} onSubmit={submitKYC} />
    </>
  );
};

export default KYCVerificationForm;
