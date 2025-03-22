
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, User as UserIcon, Menu, ArrowLeft } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NotificationsPanel } from './NotificationsPanel';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const goBack = () => {
    navigate(-1);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-screen-xl mx-auto h-full px-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/mining')}>
            <img 
              src="/lovable-uploads/51c75bd9-9eaf-46e5-86a8-c39bdc1354d5.png" 
              alt="DMI Logo" 
              className="h-8 w-auto"
            />
          </div>

          {/* Back button on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 md:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            onClick={goBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Balance */}
          {user && (
            <div className="flex-1 flex justify-center">
              <div className="px-3 py-1 rounded-full bg-gray-100 flex items-center">
                <span className="text-gray-700 font-medium text-sm">{user.balance} DMI</span>
              </div>
            </div>
          )}

          {/* User actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Notifications - Now using NotificationsPanel component instead of just an icon */}
                <div className="relative">
                  <NotificationsPanel />
                </div>
                
                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100" aria-label="User menu">
                      <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/wallet')}>
                      Wallet
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/rewards')}>
                      Rewards
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" className="text-gray-600 hover:bg-gray-100" onClick={() => navigate('/signin')}>Sign In</Button>
                <Button className="bg-dmi hover:bg-dmi/90 text-white" onClick={() => navigate('/signup')}>Sign Up</Button>
              </>
            )}
          </div>
        </div>
      </header>
      {/* Extra padding to prevent content from being hidden under the fixed header */}
      <div className="h-16" />
    </>
  );
};

export default Header;
