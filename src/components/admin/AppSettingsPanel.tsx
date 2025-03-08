
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateAppSettings } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertCircle,
  InfoIcon
} from 'lucide-react';
import { 
  Alert,
  AlertDescription
} from "@/components/ui/alert";

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
  const { toast } = useToast();

  const handleSaveSettings = async () => {
    if (!version.trim() || !updateUrl.trim()) {
      toast({
        title: "Validation Error",
        description: "Both version and update URL are required.",
        variant: "destructive",
      });
      return;
    }

    // Validate version format (semver)
    if (!/^\d+\.\d+\.\d+$/.test(version)) {
      toast({
        title: "Invalid Version Format",
        description: "Version must be in format X.Y.Z (e.g., 1.0.0)",
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
      const success = await updateAppSettings(version, updateUrl);
      
      if (success) {
        toast({
          title: "Settings Updated",
          description: "App version and update URL have been successfully updated.",
        });
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
      
      <Alert className="mb-4">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          When you update the app version, users with older versions will receive notifications 
          three times daily until they update.
        </AlertDescription>
      </Alert>
      
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
          <p className="text-xs text-gray-500 mt-1">
            Use semantic versioning (X.Y.Z). Increase version to notify users about updates.
          </p>
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
          <p className="text-xs text-gray-500 mt-1">
            URL where users can download the latest version of the app.
          </p>
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
