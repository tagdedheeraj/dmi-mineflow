
import React from 'react';
import { KYCDocument } from '@/lib/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Clock } from 'lucide-react';

interface KYCPendingStatusProps {
  kycStatus?: KYCDocument;
}

const KYCPendingStatus: React.FC<KYCPendingStatusProps> = ({ kycStatus }) => {
  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-yellow-500" />
          KYC Verification In Review
        </CardTitle>
        <CardDescription>
          Your verification is currently being reviewed by our team.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="bg-yellow-50 border-yellow-200">
          <Clock className="h-4 w-4 text-yellow-500" />
          <AlertTitle>Verification In Progress</AlertTitle>
          <AlertDescription>
            Your KYC verification is being reviewed by our team. This process typically takes 24-48 hours. 
            You will be notified once the verification is complete.
          </AlertDescription>
        </Alert>
        
        <div className="mt-6 space-y-4">
          <h4 className="text-sm font-medium mb-2">Submitted Information</h4>
          <div className="bg-gray-50 p-4 rounded-md space-y-2">
            {kycStatus && (
              <>
                <div>
                  <span className="text-sm text-gray-500">Name:</span>
                  <div className="font-medium">{kycStatus.fullName}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Document Type:</span>
                  <div className="font-medium">
                    {kycStatus.documentType === 'government_id' ? 'Government ID' : 'Passport'}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Submitted On:</span>
                  <div className="font-medium">
                    {kycStatus.submittedAt && kycStatus.submittedAt.toDate ? 
                      new Date(kycStatus.submittedAt.toDate()).toLocaleDateString() : 
                      'Recently'}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>Please wait while we verify your documents. You'll receive a notification once the process is complete.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default KYCPendingStatus;
