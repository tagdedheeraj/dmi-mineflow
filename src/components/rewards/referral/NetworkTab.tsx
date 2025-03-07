
import React from 'react';
import { Network, Users } from 'lucide-react';
import ReferralNetworkVisualization from '../ReferralNetworkVisualization';

interface NetworkTabProps {
  referralNetwork: any[];
  referralStats: any;
}

const NetworkTab: React.FC<NetworkTabProps> = ({ referralNetwork, referralStats }) => {
  return (
    <div className="p-4 space-y-4">
      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm mb-4">
        <h3 className="text-md font-medium flex items-center text-gray-700 mb-2">
          <Network className="h-5 w-5 mr-2 text-dmi" />
          My Referral Network
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          View your complete referral network below. 
          Your network can grow up to 5 levels deep, and you earn rewards for each level!
        </p>
        
        <div className="h-60 bg-gray-50 rounded-lg p-2 border border-gray-200 overflow-hidden">
          <ReferralNetworkVisualization network={referralNetwork} />
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md font-medium text-gray-700">Network Statistics</h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {referralStats.totalReferrals} Total Users
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-600">Level 1</p>
            <p className="font-medium text-blue-700">{referralStats.level1Count || 0}</p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-600">Level 2</p>
            <p className="font-medium text-green-700">{referralStats.level2Count || 0}</p>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-600">Level 3</p>
            <p className="font-medium text-purple-700">{referralStats.level3Count || 0}</p>
          </div>
          
          <div className="bg-orange-50 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-600">Level 4</p>
            <p className="font-medium text-orange-700">{referralStats.level4Count || 0}</p>
          </div>
          
          <div className="bg-indigo-50 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-600">Level 5</p>
            <p className="font-medium text-indigo-700">{referralStats.level5Count || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkTab;
