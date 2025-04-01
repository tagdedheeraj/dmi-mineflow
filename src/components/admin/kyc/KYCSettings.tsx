
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface KYCSettingsProps {
  isEnabled: boolean;
  isLoading: boolean;
  onToggle: (enabled: boolean) => void;
}

const KYCSettings: React.FC<KYCSettingsProps> = ({
  isEnabled,
  isLoading,
  onToggle
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id="kyc-enabled"
        checked={isEnabled}
        onCheckedChange={onToggle}
        disabled={isLoading}
      />
      <Label htmlFor="kyc-enabled">
        {isEnabled ? 'KYC Required' : 'KYC Disabled'}
      </Label>
    </div>
  );
};

export default KYCSettings;
