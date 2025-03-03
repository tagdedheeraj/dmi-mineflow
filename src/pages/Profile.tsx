
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Clock, Settings } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 animate-fade-in">
      {/* Header */}
      <Header />
      
      {/* Main content */}
      <main className="pt-24 px-4 max-w-screen-md mx-auto">
        <Button 
          variant="ghost"
          className="mb-6 flex items-center text-gray-600"
          onClick={() => navigate('/mining')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Mining
        </Button>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-dmi-light/10 border-b border-gray-100 p-6">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-dmi/10 flex items-center justify-center mr-4">
                <User className="h-8 w-8 text-dmi" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center text-gray-600 mb-2">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm">Account created</span>
                </div>
                <p className="text-gray-900 font-medium">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center text-gray-600 mb-2">
                  <Settings className="h-4 w-4 mr-2" />
                  <span className="text-sm">Account status</span>
                </div>
                <p className="text-gray-900 font-medium">
                  Active
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">DMI Balance</h2>
              <div className="bg-dmi/10 rounded-lg p-6 text-center">
                <p className="text-3xl font-bold text-gray-900">{user.balance} DMI</p>
                <p className="text-gray-600 mt-1">Current balance</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <Button className="w-full" variant="outline">
                Update Profile
              </Button>
              <Button className="w-full" variant="outline">
                Change Password
              </Button>
              <Button 
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 border-red-100"
                onClick={signOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
