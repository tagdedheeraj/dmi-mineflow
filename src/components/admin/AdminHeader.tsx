
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, ArrowLeft } from 'lucide-react';

interface AdminHeaderProps {
  user: {
    id: string;
    email: string;
  } | null;
  signOut: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ user, signOut }) => {
  const navigate = useNavigate();
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/mining')}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back to App</span>
            </button>
            <h1 className="text-xl font-semibold text-gray-900">DMI Admin Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <div className="text-sm text-gray-600">
                Logged in as <span className="font-semibold">{user.email}</span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
