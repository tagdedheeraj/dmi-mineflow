
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Clock } from 'lucide-react';

const KYCPendingStatus: React.FC = () => {
  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-yellow-500" />
          KYC Verification Pending
        </CardTitle>
        <CardDescription>
          Your verification is currently under review.
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
        
        <div className="mt-6 text-sm text-gray-500">
          <p>Please wait while we verify your documents. You'll receive a notification once the process is complete.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default KYCPendingStatus;
