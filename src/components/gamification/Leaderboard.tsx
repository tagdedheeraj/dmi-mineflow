
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Medal, Trophy, Award } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LeaderboardEntry } from '@/lib/gamificationService';

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  currentUserId?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ 
  leaderboard,
  isLoading,
  currentUserId 
}) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-gray-500 font-medium">{rank}</span>;
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-500" />
            Top Miners
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-gray-200 rounded w-full"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded w-full mt-2"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-500" />
          Top Miners
        </CardTitle>
        <CardDescription>
          The leading miners in DMI community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Rank</TableHead>
              <TableHead>Miner</TableHead>
              <TableHead className="text-right">DMI Coins</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((entry) => (
              <TableRow key={entry.userId} className={entry.userId === currentUserId ? 'bg-blue-50' : ''}>
                <TableCell className="font-medium">
                  <div className="flex items-center justify-center">
                    {getRankIcon(entry.rank || 0)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{entry.userName}</div>
                </TableCell>
                <TableCell className="text-right">
                  {entry.miningTotal.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
