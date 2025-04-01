
import React from 'react';
import { KYCDocument } from '@/lib/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface KYCRejectedStatusProps {
  kycStatus: KYCDocument;
}

const KYCRejectedStatus: React.FC<KYCRejectedStatusProps> = ({ kycStatus }) => {
  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <X className="h-5 w-5" />
          KYC Verification Rejected
        </CardTitle>
        <CardDescription>
          Your verification was not approved. Please review the details below.
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
        
        <div className="mt-8">
          <Button 
            onClick={() => window.location.reload()} 
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
