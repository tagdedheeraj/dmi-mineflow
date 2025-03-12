import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Pickaxe, Trophy, Wallet, User, Diamond } from 'lucide-react';
import { PlaneGame } from './games/PlaneGame';

const BottomBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

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

  return (
    <>
      <PlaneGame />
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
