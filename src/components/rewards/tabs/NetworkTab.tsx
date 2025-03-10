
import React from 'react';
import ReferralNetworkVisualization from '../ReferralNetworkVisualization';

interface NetworkTabProps {
  referralNetwork: any[];
}

const NetworkTab: React.FC<NetworkTabProps> = ({ referralNetwork }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-md font-medium">My Referral Network</h3>
      <p className="text-sm text-gray-600 mb-4">
        View your complete referral network below. 
        Your network can grow up to 5 levels deep, and you earn rewards for each level!
      </p>
      
      <div className="h-60 bg-gray-50 rounded-lg p-2 border border-gray-200">
        <ReferralNetworkVisualization network={referralNetwork} />
      </div>
    </div>
  );
};

export default NetworkTab;
