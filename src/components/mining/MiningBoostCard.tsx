
import React from 'react';
import { Zap, Info } from 'lucide-react';

interface MiningBoostCardProps {
  boostPercentage: number;
  miningRate: number;
}

const MiningBoostCard: React.FC<MiningBoostCardProps> = ({ boostPercentage, miningRate }) => {
  return (
    <div className="mt-6 bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Your Mining Boost</p>
          <p className="text-lg font-medium">Faster mining means more earnings</p>
        </div>
        <div className="bg-yellow-500/20 text-yellow-700 px-3 py-1 rounded-md font-semibold">
          {boostPercentage}% Boost
        </div>
      </div>
      
      <div className="mt-3 text-sm flex items-center text-blue-600 bg-blue-50 p-2 rounded-md">
        <Info className="h-4 w-4 mr-2" />
        <span>Your current mining speed is {miningRate.toFixed(2)}x</span>
      </div>
    </div>
  );
};

export default MiningBoostCard;
