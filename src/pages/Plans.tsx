
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import MiningPlans from '@/components/MiningPlans';

const Plans: React.FC = () => {
  const { user } = useAuth();
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
        
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Premium Mining Plans</h1>
        
        <div className="mb-6 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
          <h2 className="text-lg font-medium text-yellow-800 mb-2">Boost Your Mining Speed</h2>
          <p className="text-yellow-700">
            Purchase a premium plan to increase your mining speed and earn more DMI coins and USDT rewards. 
            All plans come with guaranteed earnings and faster mining capabilities.
          </p>
        </div>
        
        <MiningPlans />
      </main>
    </div>
  );
};

export default Plans;
