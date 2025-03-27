
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { Upload, FileUp } from 'lucide-react';
import { updateAppFile } from '@/lib/firestore';

const AppFileManagement: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select an app file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Get file extension
      const fileExt = file.name.split('.').pop();
      if (fileExt !== 'apk' && fileExt !== 'ipa') {
        throw new Error("Invalid file type. Only .apk and .ipa files are allowed.");
      }

      // Convert file to base64
      const reader = new FileReader();
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = reader.result?.toString().split(',')[1];
          if (base64) {
            resolve(base64);
          } else {
            reject("Failed to convert file to base64");
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Update the app file in Firestore
      const success = await updateAppFile(file.name, fileExt, fileBase64);
      
      if (success) {
        toast({
          title: "App File Uploaded",
          description: `The file ${file.name} has been successfully uploaded.`,
        });
        setFile(null);
      } else {
        throw new Error("Failed to upload app file");
      }
    } catch (error) {
      console.error("Error uploading app file:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload app file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm mb-8">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">App File Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="appFile" className="block text-sm font-medium text-gray-700 mb-1">
            Upload New App Version (.apk or .ipa)
          </label>
          <div className="flex space-x-2">
            <Input
              id="appFile"
              type="file"
              accept=".apk,.ipa"
              onChange={handleFileChange}
              className="flex-grow"
            />
            <Button 
              onClick={handleUpload} 
              disabled={isUploading || !file}
              className="whitespace-nowrap"
            >
              {isUploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FileUp className="mr-2 h-4 w-4" />
                  Upload File
                </>
              )}
            </Button>
          </div>
          {file && (
            <p className="text-sm text-green-600 mt-1">
              Selected file: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Note: This will update the downloadable app file for users. Only .apk (Android) and .ipa (iOS) files are accepted.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppFileManagement;
