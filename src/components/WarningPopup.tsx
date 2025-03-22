
import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const WarningPopup: React.FC = () => {
  const [isWarningOpen, setIsWarningOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="fixed bottom-20 right-16 z-50">
            <Popover open={isWarningOpen} onOpenChange={setIsWarningOpen}>
              <PopoverTrigger asChild>
                <Button 
                  className="h-12 w-12 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600"
                  onClick={() => setIsWarningOpen(true)}
                >
                  <AlertTriangle className="h-6 w-6" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" side="top">
                <div className="flex flex-col p-0">
                  <div className="flex items-center justify-between bg-red-500 text-white p-4 rounded-t-md">
                    <h3 className="font-medium text-lg">Warning: Account Suspension</h3>
                    <Button variant="ghost" size="icon" onClick={() => setIsWarningOpen(false)} className="text-white hover:bg-red-600">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <Alert className="mb-4 border-red-200 bg-red-50">
                      <AlertTitle className="text-red-700">Multiple Accounts</AlertTitle>
                      <AlertDescription className="text-red-600">
                        Creating multiple accounts from the same device is not allowed and will result in account suspension.
                      </AlertDescription>
                    </Alert>
                    
                    <Alert className="mb-4 border-red-200 bg-red-50">
                      <AlertTitle className="text-red-700">False Information</AlertTitle>
                      <AlertDescription className="text-red-600">
                        Providing false information during plan purchases or withdrawals will lead to immediate account suspension.
                      </AlertDescription>
                    </Alert>
                    
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTitle className="text-red-700">Misleading Withdrawal Requests</AlertTitle>
                      <AlertDescription className="text-red-600">
                        Attempting to mislead the system with fraudulent withdrawal requests will result in permanent account suspension.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Important warnings</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WarningPopup;
