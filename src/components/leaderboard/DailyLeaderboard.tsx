
import React, { useState, useEffect } from 'react';
import { Trophy, Star, TrendingUp, TrendingDown, User, Users } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { formatNumber } from '@/lib/utils';

interface LeaderboardUser {
  id: string;
  name: string;
  score: number;
  tier: 'gold' | 'silver' | 'bronze' | 'standard';
  change: 'up' | 'down' | 'none';
  position: number;
  avatar?: string;
}

const DailyLeaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeUntilUpdate, setTimeUntilUpdate] = useState<string>('');
  
  // Generate random leaderboard data
  const generateLeaderboardData = () => {
    const names = [
      'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Singh', 'Arjun Reddy',
      'Neha Gupta', 'Vikram Mehta', 'Sonia Verma', 'Raj Malhotra', 'Anjali Desai',
      'Karan Khanna', 'Pooja Sharma', 'Deepak Joshi', 'Meera Kapoor', 'Suresh Patel'
    ];
    
    const newData: LeaderboardUser[] = [];
    
    for (let i = 0; i < 10; i++) {
      // Random score between 5000 and 25000
      const score = Math.floor(Math.random() * 20000) + 5000;
      
      // Determine tier based on position
      let tier: LeaderboardUser['tier'] = 'standard';
      if (i === 0) tier = 'gold';
      else if (i === 1) tier = 'silver';
      else if (i === 2) tier = 'bronze';
      
      // Random change status
      const changeOptions: LeaderboardUser['change'][] = ['up', 'down', 'none'];
      const change = changeOptions[Math.floor(Math.random() * changeOptions.length)];
      
      newData.push({
        id: `user-${i + 1}`,
        name: names[Math.floor(Math.random() * names.length)],
        score,
        tier,
        change,
        position: i + 1
      });
    }
    
    // Sort by score in descending order
    return newData.sort((a, b) => b.score - a.score).map((user, index) => ({
      ...user,
      position: index + 1
    }));
  };
  
  // Calculate time until next update
  const calculateTimeUntilUpdate = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);
    
    const diffMs = tomorrow.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return `${diffHrs}h ${diffMins}m ${diffSecs}s`;
  };
  
  // Initial data load and setup interval for time update
  useEffect(() => {
    setLeaderboardData(generateLeaderboardData());
    setLastUpdated(new Date());
    
    const timeInterval = setInterval(() => {
      setTimeUntilUpdate(calculateTimeUntilUpdate());
    }, 1000);
    
    return () => clearInterval(timeInterval);
  }, []);
  
  // Simulate daily update
  useEffect(() => {
    // For demo purposes, update every 5 minutes instead of daily
    const updateInterval = setInterval(() => {
      console.log('Updating leaderboard data...');
      setLeaderboardData(generateLeaderboardData());
      setLastUpdated(new Date());
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(updateInterval);
  }, []);
  
  // Get tier badge style
  const getTierStyle = (tier: LeaderboardUser['tier']) => {
    switch (tier) {
      case 'gold':
        return 'text-yellow-600 bg-yellow-100';
      case 'silver':
        return 'text-gray-600 bg-gray-100';
      case 'bronze':
        return 'text-amber-700 bg-amber-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  
  // Get change icon
  const getChangeIcon = (change: LeaderboardUser['change']) => {
    switch (change) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  // Get position icon/number
  const getPositionDisplay = (position: number) => {
    if (position === 1) {
      return <Trophy className="h-5 w-5 text-yellow-600" />;
    } else if (position === 2) {
      return <Trophy className="h-5 w-5 text-gray-400" />;
    } else if (position === 3) {
      return <Trophy className="h-5 w-5 text-amber-700" />;
    } else {
      return <span className="text-gray-700">{position}</span>;
    }
  };
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-gradient-to-r from-dmi/10 to-dmi/5 pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-dmi" />
              Daily Leaderboard
            </CardTitle>
            <CardDescription>
              Top miners of the day
            </CardDescription>
          </div>
          <div className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded-full text-gray-600">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-0 py-0">
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-12 text-center">Rank</TableHead>
                <TableHead>Miner</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="w-12 text-center">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((user) => (
                <TableRow 
                  key={user.id}
                  className={user.position <= 3 ? `bg-opacity-50 ${user.position === 1 ? 'bg-yellow-50' : user.position === 2 ? 'bg-gray-50' : 'bg-amber-50'}` : ''}
                >
                  <TableCell className="text-center font-medium">
                    {getPositionDisplay(user.position)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${getTierStyle(user.tier)}`}>
                          {user.tier.charAt(0).toUpperCase() + user.tier.slice(1)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatNumber(user.score)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getChangeIcon(user.change)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 border-t text-center text-xs text-gray-500 p-2 flex justify-between items-center">
        <div className="flex items-center">
          <Users className="h-3 w-3 mr-1 text-gray-400" />
          <span>{leaderboardData.length} Participants</span>
        </div>
        <div>
          <span>Next update in: {timeUntilUpdate}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DailyLeaderboard;
