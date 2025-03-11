
import React from 'react';
import { Trophy } from 'lucide-react';
import ReferralLeaderboard from '../ReferralLeaderboard';

const ContestTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          <h3 className="font-semibold text-lg">Referral Contest</h3>
        </div>
        <p className="text-sm text-gray-700 mb-2">
          Join our monthly referral contest! The user with the most referrals this month wins a special prize of 5000 DMI coins!
        </p>
        <div className="text-xs bg-white bg-opacity-60 p-2 rounded text-gray-700">
          Contest ends: <span className="font-medium">August 31, 2025</span>
        </div>
      </div>
      
      <ReferralLeaderboard />
    </div>
  );
};

export default ContestTab;
