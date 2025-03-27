
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AppDownloadButton: React.FC = () => {
  const { appSettings } = useAuth();
  
  return (
    <Button
      onClick={() => window.open(appSettings.updateUrl, '_blank')}
      className="bg-dmi hover:bg-dmi/90 text-white"
    >
      <Download className="mr-2 h-4 w-4" />
      Download App
    </Button>
  );
};

export default AppDownloadButton;
