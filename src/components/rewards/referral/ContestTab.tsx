
import React from 'react';
import { Trophy } from 'lucide-react';
import ReferralLeaderboard from '../ReferralLeaderboard';

const ContestTab: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-4 rounded-lg border border-gray-100 shadow-sm mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <h3 className="font-semibold text-lg text-gray-800">Monthly Referral Contest</h3>
        </div>
        <p className="text-sm text-gray-700 mb-3">
          Join our monthly referral contest! The user with the most referrals this month wins a special prize of 5000 DMI coins!
        </p>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="bg-white bg-opacity-70 p-3 rounded-lg flex-1">
            <p className="text-xs text-gray-500">Contest ends in:</p>
            <p className="font-medium text-indigo-900">159 days</p>
          </div>
          
          <div className="bg-white bg-opacity-70 p-3 rounded-lg flex-1">
            <p className="text-xs text-gray-500">Your position:</p>
            <p className="font-medium text-indigo-900">#76</p>
          </div>
          
          <div className="bg-white bg-opacity-70 p-3 rounded-lg flex-1">
            <p className="text-xs text-gray-500">Prize pool:</p>
            <p className="font-medium text-indigo-900">5000 DMI</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
        <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
          Leaderboard
        </h3>
        
        <ReferralLeaderboard />
      </div>
    </div>
  );
};

export default ContestTab;
