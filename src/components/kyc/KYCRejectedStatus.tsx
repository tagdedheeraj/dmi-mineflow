
import React from 'react';
import { KYCDocument } from '@/lib/firestore/kyc';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface KYCRejectedStatusProps {
  kycStatus: KYCDocument;
}

const KYCRejectedStatus: React.FC<KYCRejectedStatusProps> = ({ kycStatus }) => {
  // Safe reload handler
  const handleTryAgain = () => {
    window.location.reload();
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <X className="h-5 w-5" />
          KYC Verification Rejected
        </CardTitle>
        <CardDescription>
          Your verification was not approved. Please review the details below and submit again.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="bg-red-50 border-red-200">
          <X className="h-4 w-4 text-red-500" />
          <AlertTitle>Verification Failed</AlertTitle>
          <AlertDescription>
            {kycStatus.rejectionReason || 'Your KYC verification was not approved. Please submit a new verification request with the correct information.'}
          </AlertDescription>
        </Alert>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-2">Submitted Information</h4>
          <div className="bg-gray-50 p-3 rounded-md mb-5">
            <div className="font-medium">{kycStatus.fullName}</div>
            <div className="text-sm text-gray-500">
              Document Type: {kycStatus.documentType === 'government_id' ? 'Government ID' : 'Passport'}
            </div>
            <div className="text-sm text-gray-500">
              Reviewed on: {kycStatus.reviewedAt && kycStatus.reviewedAt.toDate ? 
                kycStatus.reviewedAt.toDate().toLocaleDateString() : 'Unknown date'}
            </div>
          </div>
          
          <div className="text-sm text-gray-600 mb-5">
            <p>Please correct the issues mentioned above and submit your verification again.</p>
          </div>
        </div>
        
        <div className="mt-8">
          <Button 
            onClick={handleTryAgain}
            className="w-full md:w-auto"
          >
            Submit New Verification
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default KYCRejectedStatus;
