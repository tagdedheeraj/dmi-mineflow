
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BoostSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="p-5">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center mr-4">
            <Zap className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Mining Speed Boost</h2>
            <p className="text-sm text-gray-500">Boost your mining speed with premium plans or referrals!</p>
          </div>
        </div>
        
        <Button 
          className="w-full mt-4 flex items-center justify-center"
          onClick={() => navigate('/plans')}
        >
          <Zap className="mr-2 h-4 w-4" />
          <span>Boost Mining Speed</span>
        </Button>
      </div>
    </div>
  );
};

export default BoostSection;
