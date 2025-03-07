
import React from 'react';
import { Trophy, Medal, User } from 'lucide-react';

const ReferralLeaderboard: React.FC = () => {
  // Sample leaderboard data - would be replaced with real data in production
  const leaderboardData = [
    { id: 1, name: 'Alex Smith', referrals: 6589, position: 1 },
    { id: 2, name: 'Emma Johnson', referrals: 6269, position: 2 },
    { id: 3, name: 'Michael Brown', referrals: 5996, position: 3 },
    { id: 4, name: 'Sarah Williams', referrals: 5895, position: 4 },
    { id: 5, name: 'David Jones', referrals: 4580, position: 5 },
    { id: 6, name: 'Lisa Martin', referrals: 4372, position: 6 },
    { id: 7, name: 'Robert Wilson', referrals: 4209, position: 7 },
    { id: 8, name: 'Jennifer Lee', referrals: 3897, position: 8 },
    { id: 9, name: 'William Taylor', referrals: 3654, position: 9 },
    { id: 10, name: 'Maria Garcia', referrals: 3542, position: 10 },
  ];
  
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-700" />;
      default:
        return <span className="text-sm font-bold">{position}</span>;
    }
  };
  
  const getPositionColor = (position: number) => {
    switch (position) {
      case 1: return 'from-yellow-50 to-yellow-100 border-yellow-200';
      case 2: return 'from-gray-50 to-gray-100 border-gray-200';
      case 3: return 'from-amber-50 to-amber-100 border-amber-200';
      default: return '';
    }
  };
  
  return (
    <div className="overflow-hidden border rounded-lg">
      <div className="divide-y divide-gray-100">
        {leaderboardData.map(user => (
          <div 
            key={user.id} 
            className={`p-3 flex items-center justify-between ${
              user.position <= 3 
                ? `bg-gradient-to-r ${getPositionColor(user.position)}` 
                : 'bg-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`
                w-8 h-8 flex items-center justify-center rounded-full
                ${user.position === 1 ? 'bg-yellow-100' : ''}
                ${user.position === 2 ? 'bg-gray-100' : ''}
                ${user.position === 3 ? 'bg-amber-100' : ''}
                ${user.position > 3 ? 'bg-gray-50' : ''}
              `}>
                {getPositionIcon(user.position)}
              </div>
              
              <div>
                <span className="font-medium text-sm">{user.name}</span>
                <div className="text-xs text-gray-500">
                  {user.position === 1 ? '1st Place' : ''}
                  {user.position === 2 ? '2nd Place' : ''}
                  {user.position === 3 ? '3rd Place' : ''}
                  {user.position > 3 ? `${user.position}th Place` : ''}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="text-xs font-medium px-2 py-1 rounded-full bg-dmi/10 text-dmi">
                {user.referrals.toLocaleString()} referrals
              </div>
              
              {user.position === 1 && (
                <div className="text-xs text-yellow-600 mt-1">
                  5000 DMI Prize
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 bg-gray-50 border-t flex items-center justify-between text-xs text-gray-500">
        <span>Contest ends in 159 days</span>
        <button className="text-dmi hover:underline">View Full Leaderboard</button>
      </div>
    </div>
  );
};

export default ReferralLeaderboard;
