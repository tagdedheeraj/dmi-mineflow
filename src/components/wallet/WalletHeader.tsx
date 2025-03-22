
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WalletHeaderProps {
  isAdmin: boolean;
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
}

const WalletHeader: React.FC<WalletHeaderProps> = ({ 
  isAdmin, 
  isRefreshing, 
  onRefresh 
}) => {
  const navigate = useNavigate();

  return (
    <>
      {isAdmin && (
        <div className="mb-6 bg-dmi/10 rounded-xl p-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">Admin Access</h2>
            <p className="text-sm text-gray-600">You have administrator privileges</p>
          </div>
          <Button onClick={() => navigate('/admin')}>
            Go to Admin Dashboard
          </Button>
        </div>
      )}
      
      <div className="mb-4 flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Wallet'}</span>
        </Button>
      </div>
    </>
  );
};

export default WalletHeader;
