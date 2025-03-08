
import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import MiningPlans from '@/components/MiningPlans';
import DMIBooster from '@/components/DMIBooster';
import { dmiBoosters } from '@/data/dmiBoosters';

const Plans: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const boostersRef = useRef<HTMLDivElement>(null);

  if (!user) {
    navigate('/signin');
    return null;
  }

  // Handle hash navigation for scrolling to specific sections
  useEffect(() => {
    if (location.hash === '#dmi-boosters' && boostersRef.current) {
      setTimeout(() => {
        boostersRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-fade-in">
      {/* Header */}
      <Header />
      
      {/* Main content */}
      <main className="pt-24 px-4 max-w-screen-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Arbitrage Plans & DMI Booster</h1>
        
        <div className="mb-6 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
          <h2 className="text-lg font-medium text-yellow-800 mb-2">Boost Your Mining Speed</h2>
          <p className="text-yellow-700">
            Purchase a premium plan to increase your mining speed and earn more DMI coins and USDT rewards. 
            All plans come with guaranteed earnings and faster mining capabilities.
          </p>
        </div>
        
        {/* Arbitrage Plans section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Arbitrage Plans</h2>
          <MiningPlans />
        </div>
        
        {/* DMI Boosters section with ref for hash navigation */}
        <div className="mb-8" ref={boostersRef} id="dmi-boosters">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">DMI Boosters</h2>
          <DMIBooster dmiBoosters={dmiBoosters} />
        </div>
      </main>
    </div>
  );
};

export default Plans;
