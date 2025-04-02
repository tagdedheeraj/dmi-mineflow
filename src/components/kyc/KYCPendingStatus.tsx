
import React from 'react';
import { KYCDocument } from '@/lib/firestore/kyc';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';

interface KYCPendingStatusProps {
  kycStatus: Partial<KYCDocument> & { status: 'pending' };
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
          Your KYC verification is being reviewed by our team.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="bg-yellow-50 border-yellow-200 mb-4">
          <Clock className="h-4 w-4 text-yellow-500" />
          <AlertTitle>Verification In Progress</AlertTitle>
          <AlertDescription>
            Your KYC verification request has been submitted and is currently under review. 
            This process typically takes 3-5 business days. We'll notify you once the verification is complete.
          </AlertDescription>
        </Alert>
        
        <Alert className="bg-blue-50 border-blue-200 mb-6">
          <AlertDescription className="text-blue-800">
            Due to high volume of verification requests, there might be a slight delay in the review process. 
            We appreciate your patience and understanding.
          </AlertDescription>
        </Alert>
        
        {kycStatus.fullName && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Personal Information</h4>
              <div className="bg-gray-50 p-3 rounded-md space-y-2">
                <div>
                  <Label className="text-xs text-gray-500">Full Name</Label>
                  <div className="font-medium">{kycStatus.fullName}</div>
                </div>
                {kycStatus.documentType && (
                  <div>
                    <Label className="text-xs text-gray-500">Document Type</Label>
                    <div className="font-medium">
                      {kycStatus.documentType === 'government_id' ? 'Government ID' : 'Passport'}
                    </div>
                  </div>
                )}
                {kycStatus.idNumber && (
                  <div>
                    <Label className="text-xs text-gray-500">Document Number</Label>
                    <div className="font-medium">{kycStatus.idNumber}</div>
                  </div>
                )}
              </div>
            </div>
            {kycStatus.submittedAt && (
              <div>
                <h4 className="text-sm font-medium mb-2">Submission Date</h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="font-medium">
                    {kycStatus.submittedAt && kycStatus.submittedAt.toDate
                      ? kycStatus.submittedAt.toDate().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : typeof kycStatus.submittedAt === 'object' && kycStatus.submittedAt instanceof Date
                        ? kycStatus.submittedAt.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Processing'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KYCPendingStatus;
