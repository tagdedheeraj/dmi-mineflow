
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMining } from '@/contexts/MiningContext';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import MainnetCard from '@/components/MainnetCard';
import MiningCard from '@/components/MiningCard';

const Mining: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  // Calculate the mainnet launch date (August 2025)
  const mainnetLaunchDate = new Date('2025-08-01');
  
  // Calculate days left until mainnet launch
  const calculateDaysLeft = () => {
    const today = new Date();
    const diffTime = mainnetLaunchDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Current date is March 3, 2025 as mentioned in the requirements
  // This would typically be real current date, but we're setting it for the app
  const currentDate = new Date('2025-03-03');
  
  // Days left until mainnet launch (defined as 175 days in requirements)
  const daysLeft = 175;

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-dmi border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 animate-fade-in">
      {/* Header */}
      <Header />
      
      {/* Main content */}
      <main className="pt-24 px-4 max-w-screen-md mx-auto">
        <div className="space-y-6">
          {/* Mainnet launch card */}
          <MainnetCard 
            launchDate={mainnetLaunchDate} 
            daysLeft={daysLeft} 
          />
          
          {/* Mining station card */}
          <MiningCard />
          
          {/* Additional cards can be added here */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 card-hover-effect">
              <h3 className="text-lg font-medium text-gray-900">Referral Program</h3>
              <p className="text-sm text-gray-500 mt-1">
                Invite friends and earn 5% of their mining rewards
              </p>
              <Button 
                className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-800"
              >
                Copy Referral Link
              </Button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 card-hover-effect">
              <h3 className="text-lg font-medium text-gray-900">Mining Statistics</h3>
              <p className="text-sm text-gray-500 mt-1">
                View your mining activity and performance
              </p>
              <Button 
                className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-800"
              >
                View Stats
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Mining;
