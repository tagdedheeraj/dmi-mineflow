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
  showBadge = false,
  onSettingsUpdated
}) => {
  const [version, setVersion] = useState(currentVersion);
  const [updateUrl, setUpdateUrl] = useState(currentUpdateUrl);
  const [displayLovableBadge, setDisplayLovableBadge] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    setDisplayLovableBadge(false);
    localStorage.setItem('showLovableBadge', 'false');
    
    if (typeof window !== 'undefined') {
      (window as any).HIDE_LOVABLE_BADGE = true;
    }
    
    document.documentElement.setAttribute('data-hide-lovable-badge', 'true');
    
    try {
      const badges = document.querySelectorAll('[data-lovable-badge]');
      badges.forEach(badge => {
        if (badge.parentNode) {
          badge.parentNode.removeChild(badge);
        }
      });
    } catch (error) {
      console.error('Error removing badges:', error);
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
      await updateAppSettings(version, updateUrl, false);
      
      localStorage.setItem('appVersion', version);
      localStorage.setItem('showLovableBadge', 'false');
      
      if (typeof window !== 'undefined') {
        (window as any).HIDE_LOVABLE_BADGE = true;
      }
      
      document.documentElement.setAttribute('data-hide-lovable-badge', 'true');
      
      try {
        const badges = document.querySelectorAll('[data-lovable-badge]');
        badges.forEach(badge => {
          if (badge.parentNode) {
            badge.parentNode.removeChild(badge);
          }
        });
      } catch (error) {
        console.error('Error removing badges after update:', error);
      }
      
      toast({
        title: "Settings Updated",
        description: "App settings have been successfully updated.",
      });
      
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
        
        <div className="hidden">
          <div className="flex items-center space-x-2">
            <Switch
              id="lovable-badge"
              checked={false}
              onCheckedChange={() => {}}
            />
            <label className="text-sm font-medium">
              Display "Edit with Lovable" Popup
            </label>
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
