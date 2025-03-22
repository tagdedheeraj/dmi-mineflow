
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Pickaxe, Trophy, Wallet, User, Diamond, HelpCircle, X, Mail, MessageCircle, ExternalLink, BookOpen } from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
              <Sheet open={isHelpOpen} onOpenChange={setIsHelpOpen}>
                <SheetTrigger asChild>
                  <Button 
                    className="h-12 w-12 rounded-full bg-dmi text-white shadow-lg hover:bg-dmi/90"
                    onClick={() => setIsHelpOpen(true)}
                  >
                    <HelpCircle className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle className="text-xl text-dmi flex items-center gap-2">
                      <HelpCircle className="h-5 w-5" /> DMI Support Center
                    </SheetTitle>
                    <SheetDescription>
                      We're here to help you with any questions or issues you may have.
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Contact Support</CardTitle>
                        <CardDescription>
                          Reach out to our support team for personalized assistance
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-start gap-4 mb-4">
                          <Mail className="h-5 w-5 text-dmi mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Email Support</p>
                            <p className="text-sm text-muted-foreground">
                              Get help with your account, staking, or any technical issues
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          onClick={handleEmailSupport} 
                          className="w-full"
                        >
                          <Mail className="mr-2 h-4 w-4" /> Contact Support
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Help Resources</CardTitle>
                        <CardDescription>
                          Find answers to common questions
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2 space-y-4">
                        <div className="flex items-start gap-4">
                          <BookOpen className="h-5 w-5 text-dmi mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Knowledge Base</p>
                            <p className="text-sm text-muted-foreground">
                              Access tutorials and guides on using DMI platform
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4">
                          <MessageCircle className="h-5 w-5 text-dmi mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Community Forum</p>
                            <p className="text-sm text-muted-foreground">
                              Connect with other users and share experiences
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4">
                          <ExternalLink className="h-5 w-5 text-dmi mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Social Media</p>
                            <p className="text-sm text-muted-foreground">
                              Follow us for latest updates and announcements
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <SheetFooter className="mt-6 flex-col sm:flex-row sm:justify-between sm:space-x-0">
                    <p className="text-xs text-muted-foreground">
                      DMI Network Support Team © {new Date().getFullYear()}
                    </p>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
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
