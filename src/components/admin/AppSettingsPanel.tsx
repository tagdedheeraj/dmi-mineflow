
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateAppSettings } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface AppSettingsProps {
  currentVersion: string;
  currentUpdateUrl: string;
  showBadge?: boolean;
  onSettingsUpdated: () => void;
}

const AppSettingsPanel: React.FC<AppSettingsProps> = ({ 
  currentVersion, 
  currentUpdateUrl,
  showBadge = true,
  onSettingsUpdated
}) => {
  const [version, setVersion] = useState(currentVersion);
  const [updateUrl, setUpdateUrl] = useState(currentUpdateUrl);
  const [displayLovableBadge, setDisplayLovableBadge] = useState(showBadge);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  // Initialize the badge display setting from localStorage if available
  useEffect(() => {
    const storedBadgeSetting = localStorage.getItem('showLovableBadge');
    if (storedBadgeSetting !== null) {
      setDisplayLovableBadge(storedBadgeSetting === 'true');
    }
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
      console.log("Updating app settings with badge display:", displayLovableBadge);
      
      // Update settings with the badge display preference
      await updateAppSettings(version, updateUrl, displayLovableBadge);
      
      // Update local storage for admin's own version
      localStorage.setItem('appVersion', version);
      
      // Save the badge display preference to localStorage for immediate effect
      localStorage.setItem('showLovableBadge', displayLovableBadge ? 'true' : 'false');
      
      // Force the badge to be hidden immediately if setting is disabled
      if (!displayLovableBadge) {
        window.HIDE_LOVABLE_BADGE = true;
        document.documentElement.setAttribute('data-hide-lovable-badge', 'true');
        
        // Force any existing badge to be removed
        const existingBadges = document.querySelectorAll('[data-lovable-badge]');
        existingBadges.forEach(badge => badge.remove());
      } else {
        window.HIDE_LOVABLE_BADGE = false;
        document.documentElement.removeAttribute('data-hide-lovable-badge');
      }
      
      toast({
        title: "Settings Updated",
        description: "App settings have been successfully updated.",
      });
      
      // This will trigger the settings update in the parent component
      onSettingsUpdated();
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
        
        <div className="flex flex-col space-y-2 border-t pt-4 mt-4">
          <h3 className="text-md font-medium">Lovable Badge Settings</h3>
          <p className="text-sm text-gray-500 mb-2">
            When enabled, the "Edit with Lovable" popup will be displayed on your website. 
            Disable this setting to remove the popup completely.
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="lovable-badge"
                checked={displayLovableBadge}
                onCheckedChange={setDisplayLovableBadge}
              />
              <label
                htmlFor="lovable-badge"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Display "Edit with Lovable" Popup
              </label>
            </div>
            
            {displayLovableBadge ? (
              <Badge variant="default" className="bg-green-500">Enabled</Badge>
            ) : (
              <Badge variant="outline" className="text-red-500 border-red-500">Disabled</Badge>
            )}
          </div>
        </div>
        
        <Button 
          onClick={handleSaveSettings} 
          disabled={isUpdating}
          className="w-full mt-4"
        >
          {isUpdating ? "Updating..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
};

export default AppSettingsPanel;
