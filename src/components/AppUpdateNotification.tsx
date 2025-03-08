
import React from 'react';
import { AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppVersionCheck } from '@/hooks/useAppVersionCheck';

const AppUpdateNotification = () => {
  const { needsUpdate, updateUrl, currentVersion, markAsUpdated } = useAppVersionCheck();

  if (!needsUpdate) return null;

  const handleUpdate = () => {
    window.open(updateUrl, '_blank');
    // We don't mark as updated here because the user needs to actually install the update
  };

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-4 rounded-md">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-amber-800">Update Required</h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>
              A new version ({currentVersion}) of the DMI app is available. 
              Please update to access new features and improvements.
            </p>
          </div>
          <div className="mt-4">
            <Button 
              size="sm" 
              onClick={handleUpdate}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Update Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppUpdateNotification;
