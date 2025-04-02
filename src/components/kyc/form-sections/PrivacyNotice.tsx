
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

const PrivacyNotice: React.FC = () => {
  return (
    <Alert>
      <Shield className="h-4 w-4" />
      <AlertTitle>Privacy Notice</AlertTitle>
      <AlertDescription>
        Your personal information and documents will be securely stored and used solely for verification purposes. 
        We comply with all applicable data protection regulations.
      </AlertDescription>
    </Alert>
  );
};

export default PrivacyNotice;
