
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Sparkles } from 'lucide-react';

const ReferAndEarnCard: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div 
      className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl shadow-sm border border-indigo-100 card-hover-effect overflow-hidden relative cursor-pointer" 
      onClick={() => navigate('/rewards')}
    >
      <div className="absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 bg-indigo-100 rounded-full opacity-70"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 -mb-6 -ml-6 bg-purple-100 rounded-full opacity-50"></div>
      
      <div className="flex items-center mb-3">
        <div className="h-8 w-8 rounded-full bg-dmi/10 flex items-center justify-center mr-3">
          <Users className="h-4 w-4 text-dmi" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Refer & Earn</h3>
        </div>
      </div>
      
      <div className="relative">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
          <Sparkles className="w-3 h-3 mr-1" />
          Now Available!
        </span>
        
        <p className="text-sm text-gray-600 mt-1">
          Invite your friends and earn <span className="font-semibold">200 DMI coins</span> for each friend who joins using your referral code.
        </p>
        
        <p className="text-sm text-gray-600 mt-2 font-medium">
          Start earning bonus coins today by sharing your unique referral link!
        </p>
        
        <Button 
          className="mt-4 w-full bg-dmi hover:bg-dmi/90 text-white"
          onClick={(e) => {
            e.stopPropagation();
            navigate('/rewards');
          }}
        >
          Start Referring
        </Button>
      </div>
    </div>
  );
};

export default ReferAndEarnCard;
