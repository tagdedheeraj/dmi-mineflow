
import React from 'react';
import { KYCDocument } from '@/lib/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Shield } from 'lucide-react';
import { format } from 'date-fns';

interface KYCApprovedStatusProps {
  kycStatus: KYCDocument;
}

const KYCApprovedStatus: React.FC<KYCApprovedStatusProps> = ({ kycStatus }) => {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    if (timestamp.toDate) {
      // Firestore timestamp
      return format(timestamp.toDate(), 'PPP');
    } else if (typeof timestamp === 'string') {
      return format(new Date(timestamp), 'PPP');
    }
    
    return 'N/A';
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          KYC Verification Approved
        </CardTitle>
        <CardDescription>
          Your identity has been successfully verified.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="bg-green-50 border-green-200">
          <Shield className="h-4 w-4 text-green-500" />
          <AlertTitle>Verification Successful</AlertTitle>
          <AlertDescription>
            Your KYC verification has been approved. You now have full access to all features of the platform.
          </AlertDescription>
        </Alert>
        
        <div className="mt-6 space-y-4">
          <h4 className="text-sm font-medium mb-2">Verified Information</h4>
          <div className="bg-gray-50 p-4 rounded-md space-y-2">
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
              <span className="text-sm text-gray-500">Verified On:</span>
              <div className="font-medium">{formatDate(kycStatus.reviewedAt)}</div>
            </div>
          </div>

          <div className="mt-4 px-4 py-3 bg-blue-50 rounded-md flex items-center text-blue-700">
            <div className="mr-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              Your account is now fully verified. Thank you for completing the KYC process.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KYCApprovedStatus;
