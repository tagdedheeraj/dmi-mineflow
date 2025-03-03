
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

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const goBack = () => {
    navigate(-1);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-dmi/90 to-dmi-dark/90 backdrop-blur-md z-50 border-b border-dmi/20 shadow-md animate-slide-down">
        <div className="max-w-screen-xl mx-auto h-full px-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/mining')}>
            <img 
              src="/lovable-uploads/51c75bd9-9eaf-46e5-86a8-c39bdc1354d5.png" 
              alt="DMI Logo" 
              className="h-10 w-auto"
            />
          </div>

          {/* Back button on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 md:hidden text-white/80 hover:text-white hover:bg-white/10"
            onClick={goBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Balance */}
          {user && (
            <div className="flex-1 flex justify-center">
              <div className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 flex items-center">
                <span className="text-white font-medium">{user.balance} DMI</span>
              </div>
            </div>
          )}

          {/* User actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="rounded-full text-white/80 hover:text-white hover:bg-white/10" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                </Button>
                
                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full text-white/80 hover:text-white hover:bg-white/10" aria-label="User menu">
                      <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-white" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 animate-fade-in">
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
                <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => navigate('/signin')}>Sign In</Button>
                <Button className="bg-white hover:bg-white/90 text-dmi" onClick={() => navigate('/signup')}>Sign Up</Button>
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
