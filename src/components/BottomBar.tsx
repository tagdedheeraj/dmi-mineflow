
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Pickaxe, Trophy, Wallet, User, Diamond, HelpCircle, Mail, MessageCircle, ExternalLink, BookOpen, Sparkles, Star, Heart, LifeBuoy, Lightbulb } from 'lucide-react';
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
                    className="h-12 w-12 rounded-full bg-gradient-to-tr from-dmi to-blue-500 text-white shadow-lg hover:shadow-blue-200/50 transition-all hover:scale-105"
                    onClick={() => setIsHelpOpen(true)}
                  >
                    <LifeBuoy className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="sm:max-w-md overflow-y-auto border-l-4 border-l-dmi">
                  <SheetHeader className="text-center sm:text-left">
                    <SheetTitle className="text-2xl text-dmi flex items-center gap-2 justify-center sm:justify-start">
                      <Sparkles className="h-6 w-6 text-yellow-500" /> DMI Support Center
                    </SheetTitle>
                    <SheetDescription className="text-base">
                      We're here to help you succeed with DMI Network
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="mt-8 space-y-6">
                    <Card className="border-2 border-dmi/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-dmi/40 bg-gradient-to-br from-white to-blue-50">
                      <CardHeader className="pb-3 bg-gradient-to-r from-dmi/10 to-transparent">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                          <Heart className="h-5 w-5 text-red-500" /> Contact Support
                        </CardTitle>
                        <CardDescription>
                          Our team is ready to assist you personally
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-start gap-4 mb-4 p-3 bg-blue-50 rounded-lg">
                          <Mail className="h-5 w-5 text-dmi mt-1" />
                          <div>
                            <p className="text-sm font-medium">Email Support</p>
                            <p className="text-sm text-muted-foreground">
                              Get help with your account, mining plans, or any technical issues
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          onClick={handleEmailSupport} 
                          className="w-full bg-gradient-to-r from-dmi to-blue-600 hover:from-blue-600 hover:to-dmi transition-all duration-300"
                        >
                          <Mail className="mr-2 h-4 w-4" /> Contact Support Team
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card className="border-2 border-dmi/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-dmi/40 bg-gradient-to-br from-white to-blue-50">
                      <CardHeader className="pb-3 bg-gradient-to-r from-dmi/10 to-transparent">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-yellow-500" /> Help Resources
                        </CardTitle>
                        <CardDescription>
                          Find answers to common questions
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2 space-y-4">
                        <div className="flex items-start gap-4 p-3 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                          <BookOpen className="h-5 w-5 text-dmi mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Knowledge Base</p>
                            <p className="text-sm text-muted-foreground">
                              Step-by-step guides on using the DMI platform
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-3 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                          <MessageCircle className="h-5 w-5 text-dmi mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Community Forum</p>
                            <p className="text-sm text-muted-foreground">
                              Connect with other users and share experiences
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-3 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                          <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Top Mining Tips</p>
                            <p className="text-sm text-muted-foreground">
                              Discover strategies to maximize your mining rewards
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-3 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
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
                  
                  <SheetFooter className="mt-6 flex-col sm:flex-row sm:justify-between sm:space-x-0 border-t pt-4">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Sparkles className="h-3 w-3 text-yellow-400" />
                      <p>DMI Network Support © {new Date().getFullYear()}</p>
                      <Sparkles className="h-3 w-3 text-yellow-400" />
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-gradient-to-r from-dmi to-blue-500 text-white border-none">
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
