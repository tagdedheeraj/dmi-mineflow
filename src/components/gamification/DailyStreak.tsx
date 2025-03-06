
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Award, Gift } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { UserStreak } from '@/lib/gamificationService';

interface DailyStreakProps {
  streak: UserStreak | null;
  isLoading: boolean;
  onClaimReward?: () => void;
}

const DailyStreak: React.FC<DailyStreakProps> = ({ 
  streak, 
  isLoading,
  onClaimReward 
}) => {
  const renderStreakDays = () => {
    if (!streak) return null;
    
    const days = Array(7).fill(0).map((_, i) => {
      const dayNum = i + 1;
      const isActive = streak.currentStreak >= dayNum;
      const isSpecial = dayNum === 3 || dayNum === 7; // Special reward days
      
      return (
        <div 
          key={dayNum}
          className={`flex flex-col items-center justify-center ${isActive ? 'opacity-100' : 'opacity-40'}`}
        >
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center mb-1
              ${isActive 
                ? isSpecial 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                  : 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-500'}`}
          >
            {isSpecial ? <Gift className="h-5 w-5" /> : dayNum}
          </div>
          <div className="text-xs">{`Day ${dayNum}`}</div>
          {isSpecial && <div className="text-xs font-bold text-purple-600">{dayNum === 3 ? '+50' : '+150'}</div>}
        </div>
      );
    });
    
    return (
      <div className="flex justify-between mt-4 px-2">
        {days}
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Daily Login Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="flex justify-between">
              {Array(7).fill(0).map((_, i) => (
                <div key={i} className="h-12 w-12 bg-gray-200 rounded-full"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Daily Login Streak
        </CardTitle>
        <CardDescription>
          Log in daily to earn streak rewards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-500">Current Streak</div>
            <div className="text-2xl font-bold">{streak?.currentStreak || 0} days</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Longest Streak</div>
            <div className="text-2xl font-bold">{streak?.longestStreak || 0} days</div>
          </div>
          <div className="bg-purple-100 p-2 rounded-full">
            <Award className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        {renderStreakDays()}
        
        {streak && streak.currentStreak >= 3 && (
          <Button 
            className="w-full mt-4" 
            variant="outline"
            onClick={onClaimReward}
          >
            Claim Streak Reward
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyStreak;
