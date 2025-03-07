
import React from 'react';
import { Trophy } from 'lucide-react';

const ReferralLeaderboard: React.FC = () => {
  // Sample leaderboard data - would be replaced with real data in production
  const leaderboardData = [
    { id: 1, name: 'Alex Smith', referrals: 6589, position: 1 },
    { id: 2, name: 'Emma Johnson', referrals: 6269, position: 2 },
    { id: 3, name: 'Michael Brown', referrals: 5996, position: 3 },
    { id: 4, name: 'Sarah Williams', referrals: 5895, position: 4 },
    { id: 5, name: 'David Jones', referrals: 4580, position: 5 },
  ];
  
  const getPositionColor = (position: number) => {
    switch (position) {
      case 1: return 'text-yellow-600';
      case 2: return 'text-gray-500';
      case 3: return 'text-amber-700';
      default: return 'text-gray-700';
    }
  };
  
  const getPositionBg = (position: number) => {
    switch (position) {
      case 1: return 'bg-yellow-100';
      case 2: return 'bg-gray-100';
      case 3: return 'bg-amber-100';
      default: return 'bg-white';
    }
  };
  
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-gray-50 p-3 border-b flex items-center justify-between">
        <h3 className="font-medium text-sm">Monthly Referral Contest</h3>
        <span className="text-xs text-gray-500">Top Referrers</span>
      </div>
      
      <div className="divide-y divide-gray-100">
        {leaderboardData.map(user => (
          <div 
            key={user.id} 
            className={`p-3 flex items-center justify-between ${getPositionBg(user.position)}`}
          >
            <div className="flex items-center space-x-3">
              <div className={`font-bold ${getPositionColor(user.position)} w-5 text-center`}>
                {user.position <= 3 ? (
                  <Trophy className="h-4 w-4" />
                ) : (
                  user.position
                )}
              </div>
              <span className="font-medium text-sm">{user.name}</span>
            </div>
            <div className="text-xs bg-dmi/10 text-dmi font-medium px-2 py-1 rounded-full">
              {user.referrals} referrals
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 bg-gray-50 border-t text-center text-xs text-gray-500">
        Contest ends in 159 days
      </div>
    </div>
  );
};

export default ReferralLeaderboard;
