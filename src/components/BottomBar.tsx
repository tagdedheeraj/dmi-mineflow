
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Pickaxe, Trophy, Wallet, User, Diamond, HelpCircle, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BottomBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const isActive = (path: string): boolean => {
    return currentPath === path;
  };

  const navItems = [
    {
      name: 'Mining',
      icon: Pickaxe,
      path: '/mining',
    },
    {
      name: 'Plans',
      icon: Diamond,
      path: '/plans',
    },
    {
      name: 'Rewards',
      icon: Trophy,
      path: '/rewards',
    },
    {
      name: 'Wallet',
      icon: Wallet,
      path: '/wallet',
    },
    {
      name: 'Profile',
      icon: User,
      path: '/profile',
    },
  ];

  const handleEmailSupport = () => {
    window.location.href = 'mailto:dmi@dminetwork.us?subject=DMI App Support';
    setIsHelpOpen(false);
  };

  return (
    <>
      {/* Help Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="fixed bottom-20 right-4 z-50">
              <Popover open={isHelpOpen} onOpenChange={setIsHelpOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    className="h-12 w-12 rounded-full bg-dmi text-white shadow-lg hover:bg-dmi/90"
                    onClick={() => setIsHelpOpen(true)}
                  >
                    <HelpCircle className="h-6 w-6" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" side="top">
                  <div className="flex flex-col p-0">
                    <div className="flex items-center justify-between bg-dmi text-white p-4 rounded-t-md">
                      <h3 className="font-medium text-lg">Need Help?</h3>
                      <Button variant="ghost" size="icon" onClick={() => setIsHelpOpen(false)} className="text-white hover:bg-dmi/90">
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="p-4">
                      <p className="mb-4 text-gray-700">
                        If you need assistance with your DMI account or have any questions, our support team is ready to help.
                      </p>
                      <Button 
                        onClick={handleEmailSupport} 
                        className="w-full"
                      >
                        Contact Support
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Need help?</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 py-2 sm:px-4">
        <div className="max-w-lg mx-auto">
          <nav className="flex justify-between items-center">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center w-1/5 py-1 px-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'text-dmi bg-dmi/5'
                    : 'text-gray-500 hover:text-dmi hover:bg-gray-50'
                }`}
              >
                <item.icon
                  className={`h-5 w-5 mb-1 ${isActive(item.path) ? 'text-dmi' : ''}`}
                />
                <span className="text-xs font-medium">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default BottomBar;
