
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';

const DMIRewardsCard: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div 
      className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm border border-blue-100 card-hover-effect overflow-hidden relative cursor-pointer" 
      onClick={() => navigate('/rewards')}
    >
      <div className="absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 bg-blue-100 rounded-full opacity-70"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 -mb-6 -ml-6 bg-indigo-100 rounded-full opacity-50"></div>
      
      <div className="flex items-center mb-3">
        <div className="h-8 w-8 rounded-full bg-dmi/10 flex items-center justify-center mr-3">
          <Trophy className="h-4 w-4 text-dmi" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">DMI Rewards</h3>
        </div>
      </div>
      
      <div className="relative">
        <p className="text-sm text-gray-600 mt-1">
          Watch ads and complete tasks to earn additional DMI coins
        </p>
        
        <Button 
          className="mt-4 w-full bg-dmi hover:bg-dmi/90 text-white"
          onClick={(e) => {
            e.stopPropagation();
            navigate('/rewards');
          }}
        >
          Earn Rewards
        </Button>
      </div>
    </div>
  );
};

export default DMIRewardsCard;
