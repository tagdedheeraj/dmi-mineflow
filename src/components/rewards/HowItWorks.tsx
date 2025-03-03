
import React from 'react';
import { Award } from 'lucide-react';

const HowItWorks: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <Award className="h-5 w-5 mr-2 text-dmi" />
        How It Works
      </h2>
      
      <div className="space-y-4">
        <div className="flex">
          <div className="h-6 w-6 rounded-full bg-dmi/10 flex items-center justify-center mr-3 mt-0.5">
            <span className="text-xs font-bold text-dmi">1</span>
          </div>
          <div>
            <p className="text-gray-800">Watch short ads to earn DMI coins</p>
            <p className="text-sm text-gray-500">Each ad earns you 1 DMI coin</p>
          </div>
        </div>
        
        <div className="flex">
          <div className="h-6 w-6 rounded-full bg-dmi/10 flex items-center justify-center mr-3 mt-0.5">
            <span className="text-xs font-bold text-dmi">2</span>
          </div>
          <div>
            <p className="text-gray-800">Wait 1 minute between ads</p>
            <p className="text-sm text-gray-500">Countdown timer will show when next ad is available</p>
          </div>
        </div>
        
        <div className="flex">
          <div className="h-6 w-6 rounded-full bg-dmi/10 flex items-center justify-center mr-3 mt-0.5">
            <span className="text-xs font-bold text-dmi">3</span>
          </div>
          <div>
            <p className="text-gray-800">Watch up to 20 ads per day</p>
            <p className="text-sm text-gray-500">Daily limit resets at midnight</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
