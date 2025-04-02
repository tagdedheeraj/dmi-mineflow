
import React from 'react';
import { KYCDocument } from '@/lib/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, FileX } from 'lucide-react';

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
          <FileX className="h-4 w-4 text-red-500" />
          <AlertTitle>Document Not Valid</AlertTitle>
          <AlertDescription className="pt-2 space-y-2">
            <p className="font-medium">Rejection Reason:</p>
            <p className="text-red-600 bg-red-100 p-3 rounded-md">
              {kycStatus.rejectionReason || 'The documents provided do not meet our verification requirements.'}
            </p>
          </AlertDescription>
        </Alert>
        
        <div className="mt-8 space-y-4">
          <p className="text-gray-700">
            Please submit a new verification request with valid documents that meet our requirements:
          </p>
          <ul className="list-disc pl-5 text-gray-600 space-y-1">
            <li>Make sure the document is not expired</li>
            <li>Ensure all text is clearly visible and not blurry</li>
            <li>The entire document must be visible in the photo</li>
            <li>Your selfie should clearly show your face alongside your ID</li>
          </ul>
          
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full md:w-auto mt-4"
          >
            Submit New Verification
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default KYCRejectedStatus;
