
import React from 'react';
import { AlertTriangle, Download, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppVersionCheck } from '@/hooks/useAppVersionCheck';
import { useLocation } from 'react-router-dom';

const AppUpdateNotification = () => {
  const { needsUpdate, updateUrl, currentVersion, lastVersion, isUpdated, markAsUpdated } = useAppVersionCheck();
  const location = useLocation();
  
  // Define paths where we don't want to show the update notification
  const hiddenPaths = ['/signin', '/signup', '/profile'];
  
  // Check if current path is in the hidden paths list
  const shouldHideNotification = hiddenPaths.some(path => location.pathname.startsWith(path));
  
  // Don't show anything if there's no update to show or we're on a hidden path
  if ((!needsUpdate && !isUpdated) || shouldHideNotification) return null;

  // Show different UI based on update status
  const handleUpdate = () => {
    window.open(updateUrl, '_blank');
    // We don't mark as updated here because the user needs to actually install the update
  };

  if (isUpdated) {
    // Show green "Updated" notification
    return (
      <div className="bg-green-50 border-l-4 border-green-400 p-4 my-4 rounded-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">App Updated</h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                Your app is up to date with the latest version ({currentVersion}).
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show update required notification
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
              {lastVersion && <span> You currently have version {lastVersion}.</span>}
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
