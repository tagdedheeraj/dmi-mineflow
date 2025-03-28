
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { updateAppSettings, getAppSettings } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { notifyAppUpdate } from '@/lib/rewards/notificationService';

interface AppSettingsProps {
  currentVersion: string;
  currentUpdateUrl: string;
  onSettingsUpdated: () => void;
}

const AppSettingsPanel: React.FC<AppSettingsProps> = ({ 
  currentVersion, 
  currentUpdateUrl,
  onSettingsUpdated
}) => {
  const [version, setVersion] = useState(currentVersion);
  const [updateUrl, setUpdateUrl] = useState(currentUpdateUrl);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showLovableBadge, setShowLovableBadge] = useState(false);
  const { toast } = useToast();

  // Fetch the current setting for lovable badge when component mounts
  useEffect(() => {
    const fetchLovableBadgeSetting = async () => {
      try {
        const settings = await getAppSettings();
        if (settings && settings.showLovableBadge !== undefined) {
          setShowLovableBadge(settings.showLovableBadge);
        }
      } catch (error) {
        console.error("Error fetching lovable badge setting:", error);
      }
    };
    
    fetchLovableBadgeSetting();
  }, []);

  const handleSaveSettings = async () => {
    if (!version.trim() || !updateUrl.trim()) {
      toast({
        title: "Validation Error",
        description: "Both version and update URL are required.",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(updateUrl);
    } catch (e) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL including http:// or https://",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const success = await updateAppSettings(version, updateUrl, showLovableBadge);
      
      if (success) {
        // Update local storage for admin's own version
        localStorage.setItem('appVersion', version);
        
        toast({
          title: "Settings Updated",
          description: "App version, update URL, and Lovable badge settings have been successfully updated.",
        });
        
        // This will trigger the settings update in the parent component
        onSettingsUpdated();
      } else {
        throw new Error("Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating app settings:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update app settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4">App Settings</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="appVersion" className="block text-sm font-medium text-gray-700 mb-1">
            App Version
          </label>
          <Input
            id="appVersion"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="1.0.0"
            className="w-full"
          />
        </div>
        
        <div>
          <label htmlFor="updateUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Update URL
          </label>
          <Input
            id="updateUrl"
            value={updateUrl}
            onChange={(e) => setUpdateUrl(e.target.value)}
            placeholder="https://example.com/download"
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="lovableBadge" className="block text-sm font-medium text-gray-700">
              Show "Edit with Lovable" Badge
            </label>
            <p className="text-sm text-gray-500">
              Enable or disable the "Edit with Lovable" popup on the site
            </p>
          </div>
          <Switch
            id="lovableBadge"
            checked={showLovableBadge}
            onCheckedChange={setShowLovableBadge}
          />
        </div>
        
        <Button 
          onClick={handleSaveSettings} 
          disabled={isUpdating}
          className="w-full"
        >
          {isUpdating ? "Updating..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
};

export default AppSettingsPanel;
