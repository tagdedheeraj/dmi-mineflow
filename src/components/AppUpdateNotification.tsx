
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createNotification, NotificationType } from '@/lib/rewards/notificationService';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';

interface AppUpdateNotificationProps {
  userVersion: string;
  latestVersion: string;
  updateUrl: string;
  show: boolean;
}

export const AppUpdateNotification: React.FC<AppUpdateNotificationProps> = ({
  userVersion,
  latestVersion,
  updateUrl,
  show
}) => {
  if (!show) return null;

  const handleUpdate = () => {
    window.open(updateUrl, '_blank');
  };

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTitle className="flex items-center font-semibold">
        <Download className="h-4 w-4 mr-2" />
        App Update Required
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">
          A new version of the DMI Network app is available. 
          You are using version {userVersion}, but version {latestVersion} is now available.
        </p>
        <Button onClick={handleUpdate} className="mt-2">
          <Download className="mr-2 h-4 w-4" />
          Update Now
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export const useAppVersionCheck = () => {
  const { user, appSettings } = useAuth();
  const userVersion = localStorage.getItem('app_version') || '1.0.0';
  
  const isUpdateRequired = () => {
    if (!appSettings) return false;

    const userVersionParts = userVersion.split('.').map(Number);
    const latestVersionParts = appSettings.version.split('.').map(Number);

    // Compare major, minor, patch versions
    for (let i = 0; i < 3; i++) {
      if (latestVersionParts[i] > userVersionParts[i]) return true;
      if (latestVersionParts[i] < userVersionParts[i]) return false;
    }
    
    return false;
  };

  const sendUpdateNotification = async () => {
    if (!user || !appSettings) return;
    
    if (isUpdateRequired()) {
      try {
        await createNotification(
          user.id,
          NotificationType.USDT_EARNINGS, // Reusing an existing type for now
          'App Update Available',
          `Please update your app to version ${appSettings.version} for the latest features and improvements.`,
          undefined,
          { updateUrl: appSettings.updateUrl }
        );
        
        console.log('App update notification sent');
      } catch (error) {
        console.error('Failed to send update notification:', error);
      }
    }
  };

  const checkForUpdates = () => {
    return {
      isUpdateRequired: isUpdateRequired(),
      userVersion,
      latestVersion: appSettings?.version || '1.0.0',
      updateUrl: appSettings?.updateUrl || 'https://dminetwork.us'
    };
  };

  return {
    sendUpdateNotification,
    checkForUpdates
  };
};
