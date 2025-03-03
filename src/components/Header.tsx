
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, User as UserIcon, Menu } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm animate-slide-down">
      <div className="max-w-screen-xl mx-auto h-full px-4 flex items-center justify-between">
        {/* Logo and brand */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/mining')}>
          <div className="rounded-full bg-dmi/10 p-2 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-dmi flex items-center justify-center text-white font-bold">
              D
            </div>
          </div>
          <span className="font-semibold text-gray-900">DMI Mining</span>
        </div>

        {/* Balance */}
        {user && (
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100 flex items-center">
              <span className="text-dmi font-medium">{user.balance} DMI</span>
            </div>
          </div>
        )}

        {/* User actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Notifications">
                <Bell className="h-5 w-5 text-gray-600" />
              </Button>
              
              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" aria-label="User menu">
                    <div className="h-8 w-8 rounded-full bg-dmi/10 flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-dmi" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 animate-fade-in">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Mining History
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Settings
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
              <Button variant="ghost" onClick={() => navigate('/signin')}>Sign In</Button>
              <Button className="bg-dmi hover:bg-dmi-dark" onClick={() => navigate('/signup')}>Sign Up</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
