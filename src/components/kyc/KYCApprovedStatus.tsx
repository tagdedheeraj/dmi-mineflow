
import React from 'react';
import { KYCDocument } from '@/lib/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

interface KYCApprovedStatusProps {
  kycStatus: KYCDocument;
}

const KYCApprovedStatus: React.FC<KYCApprovedStatusProps> = ({ kycStatus }) => {
  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          KYC Verification Approved
        </CardTitle>
        <CardDescription>
          Your identity has been successfully verified.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Verification Successful</AlertTitle>
          <AlertDescription>
            Your KYC verification has been approved. You now have full access to all features of the platform.
          </AlertDescription>
        </Alert>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-2">Verified Information</h4>
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="font-medium">{kycStatus.fullName}</div>
            <div className="text-sm text-gray-500">Verified on {
              kycStatus.reviewedAt && kycStatus.reviewedAt.toDate
                ? kycStatus.reviewedAt.toDate().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'N/A'
            }</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KYCApprovedStatus;
