
import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import MembershipCards from '@/components/MembershipCards';
import MiningPlans from '@/components/MiningPlans';
import DMIBooster from '@/components/DMIBooster';
import { dmiBoosters } from '@/data/dmiBoosters';

const Plans: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const boostersRef = useRef<HTMLDivElement>(null);
  const arbitrageRef = useRef<HTMLDivElement>(null);

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
    } else if (location.hash === '#arbitrage-plans' && arbitrageRef.current) {
      setTimeout(() => {
        arbitrageRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-fade-in">
      {/* Header */}
      <Header />
      
      {/* Main content */}
      <main className="pt-24 px-4 max-w-screen-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Membership & Arbitrage Plans</h1>
        
        <div className="mb-6 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
          <h2 className="text-lg font-medium text-yellow-800 mb-2">Boost Your Earning Potential</h2>
          <p className="text-yellow-700">
            Activate a membership to earn both DMI coins and USDT from our powerful 5-level referral system. 
            Then purchase arbitrage plans to maximize your mining speed and daily earnings.
          </p>
        </div>
        
        {/* Membership Cards section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Membership Cards</h2>
          <MembershipCards />
        </div>
        
        {/* Arbitrage Plans section */}
        <div className="mb-8" ref={arbitrageRef} id="arbitrage-plans">
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
