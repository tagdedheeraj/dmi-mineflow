
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Wallet, Award, User, Diamond, Download } from 'lucide-react';

const BottomBar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around items-center z-10">
      <Link
        to="/mining"
        className={`flex flex-col items-center p-2 ${
          isActive('/mining') ? 'text-dmi' : 'text-gray-500'
        }`}
      >
        <Home size={20} />
        <span className="text-xs mt-1">Mine</span>
      </Link>
      
      <Link
        to="/wallet"
        className={`flex flex-col items-center p-2 ${
          isActive('/wallet') ? 'text-dmi' : 'text-gray-500'
        }`}
      >
        <Wallet size={20} />
        <span className="text-xs mt-1">Wallet</span>
      </Link>
      
      <Link
        to="/plans"
        className={`flex flex-col items-center p-2 ${
          isActive('/plans') ? 'text-dmi' : 'text-gray-500'
        }`}
      >
        <Diamond size={20} />
        <span className="text-xs mt-1">Plans</span>
      </Link>
      
      <Link
        to="/rewards"
        className={`flex flex-col items-center p-2 ${
          isActive('/rewards') ? 'text-dmi' : 'text-gray-500'
        }`}
      >
        <Award size={20} />
        <span className="text-xs mt-1">Rewards</span>
      </Link>
      
      <Link
        to="/download"
        className={`flex flex-col items-center p-2 ${
          isActive('/download') ? 'text-dmi' : 'text-gray-500'
        }`}
      >
        <Download size={20} />
        <span className="text-xs mt-1">Download</span>
      </Link>
      
      <Link
        to="/profile"
        className={`flex flex-col items-center p-2 ${
          isActive('/profile') ? 'text-dmi' : 'text-gray-500'
        }`}
      >
        <User size={20} />
        <span className="text-xs mt-1">Profile</span>
      </Link>
    </div>
  );
};

export default BottomBar;
