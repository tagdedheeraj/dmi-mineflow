
import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Flag, Star, Award } from 'lucide-react';

interface ReferralLeaderboardProps {
  daysLeft?: number;
}

interface LeaderboardUser {
  id: number;
  name: string;
  referrals: number;
  position: number;
  trend?: 'up' | 'down' | 'stable';
  avatar?: string;
}

const ReferralLeaderboard: React.FC<ReferralLeaderboardProps> = ({ daysLeft = 30 }) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Function to generate random leaderboard data
  const generateLeaderboardData = () => {
    const names = [
      'Alex Smith', 'Emma Johnson', 'Michael Brown', 'Sarah Williams', 'David Jones',
      'Olivia Davis', 'James Miller', 'Sophia Wilson', 'Robert Taylor', 'Emily White',
      'Daniel Anderson', 'Ava Martinez', 'John Thompson', 'Isabella Thomas', 'Christopher Garcia'
    ];
    
    const trends: Array<'up' | 'down' | 'stable'> = ['up', 'down', 'stable'];
    
    // Create randomized leaderboard data
    const newData: LeaderboardUser[] = [];
    for (let i = 0; i < 10; i++) {
      // Ensure descending order of referrals
      const baseReferrals = 7000 - (i * 300) + Math.floor(Math.random() * 300);
      
      newData.push({
        id: i + 1,
        name: names[Math.floor(Math.random() * names.length)],
        referrals: baseReferrals,
        position: i + 1,
        trend: trends[Math.floor(Math.random() * trends.length)]
      });
    }
    
    return newData;
  };
  
  // Initialize and update leaderboard data
  useEffect(() => {
    // Set initial data
    setLeaderboardData(generateLeaderboardData());
    setLastUpdated(new Date());
    
    // Update data every 24 hours (for demo purposes, we'll use a shorter interval)
    const interval = setInterval(() => {
      setLeaderboardData(generateLeaderboardData());
      setLastUpdated(new Date());
      console.log('Leaderboard data updated');
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    return () => clearInterval(interval);
  }, []);
  
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-600" />;
      case 2:
        return <Award className="h-4 w-4 text-gray-500" />;
      case 3:
        return <Medal className="h-4 w-4 text-amber-700" />;
      default:
        return position;
    }
  };
  
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
  
  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <span className="text-green-500 text-xs">↑</span>;
      case 'down':
        return <span className="text-red-500 text-xs">↓</span>;
      default:
        return <span className="text-gray-500 text-xs">•</span>;
    }
  };
  
  return (
    <div className="border rounded-md overflow-hidden shadow-sm">
      <div className="bg-gray-50 p-3 border-b flex items-center justify-between">
        <h3 className="font-medium text-sm flex items-center">
          <Star className="h-4 w-4 mr-1 text-yellow-500" /> 
          Monthly Leaderboard
        </h3>
        <span className="text-xs text-gray-500">
          Updated: {lastUpdated.toLocaleDateString()} {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      <div className="divide-y divide-gray-100">
        {leaderboardData.map(user => (
          <div 
            key={user.id} 
            className={`p-3 flex items-center justify-between ${user.position <= 3 ? getPositionBg(user.position) : ''}`}
          >
            <div className="flex items-center space-x-3">
              <div className={`font-bold ${getPositionColor(user.position)} w-5 text-center`}>
                {getPositionIcon(user.position)}
              </div>
              <div>
                <span className="font-medium text-sm">{user.name}</span>
                <div className="text-xs text-gray-500 flex items-center">
                  {getTrendIcon(user.trend)} 
                  <span className="ml-1">{user.trend === 'up' ? 'Rising' : user.trend === 'down' ? 'Falling' : 'Steady'}</span>
                </div>
              </div>
            </div>
            <div className="text-xs bg-dmi/10 text-dmi font-medium px-2 py-1 rounded-full">
              {user.referrals.toLocaleString()} referrals
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 bg-gray-50 border-t text-center text-xs text-gray-500">
        Contest ends in {daysLeft} days
      </div>
    </div>
  );
};

export default ReferralLeaderboard;
