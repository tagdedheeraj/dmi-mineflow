
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Calendar, CheckCircle, Coins, Trophy, Users, Video } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Achievement, UserAchievement } from '@/lib/gamificationService';

interface AchievementsProps {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  isLoading: boolean;
  onClaimReward: (achievementId: string) => void;
}

const Achievements: React.FC<AchievementsProps> = ({ 
  achievements, 
  userAchievements,
  isLoading,
  onClaimReward
}) => {
  // Function to get the appropriate icon
  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'flame':
        return <Calendar className="h-5 w-5" />;
      case 'pick':
        return <Coins className="h-5 w-5" />;
      case 'users':
        return <Users className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      default:
        return <Trophy className="h-5 w-5" />;
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-3 border rounded">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-40"></div>
                  </div>
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Map achievements with their progress
  const achievementsWithProgress = achievements.map(achievement => {
    const userProgress = userAchievements.find(ua => ua.achievementId === achievement.id);
    return {
      ...achievement,
      progress: userProgress?.progress || 0,
      completed: userProgress?.completed || false,
      rewardClaimed: userProgress?.rewardClaimed || false,
    };
  });
  
  // Sort achievements: completed unclaimed first, then in-progress, then claimed
  const sortedAchievements = [...achievementsWithProgress].sort((a, b) => {
    if (a.completed && !a.rewardClaimed && !(b.completed && !b.rewardClaimed)) return -1;
    if (b.completed && !b.rewardClaimed && !(a.completed && !a.rewardClaimed)) return 1;
    if (a.completed && b.completed) return 0;
    if (a.progress / a.requirement > b.progress / b.requirement) return -1;
    return 1;
  });
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Achievements
        </CardTitle>
        <CardDescription>
          Complete tasks to earn rewards
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto pr-2">
        <div className="space-y-3">
          {sortedAchievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className={`p-3 border rounded-lg flex justify-between items-center 
                ${achievement.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center 
                  ${achievement.completed 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-500'}`}>
                  {getAchievementIcon(achievement.icon)}
                </div>
                <div>
                  <div className="font-medium flex items-center gap-1">
                    {achievement.title}
                    {achievement.completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                  <div className="text-xs text-gray-500">{achievement.description}</div>
                  {!achievement.completed && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full" 
                        style={{ width: `${Math.min(100, (achievement.progress / achievement.requirement) * 100)}%` }}
                      ></div>
                    </div>
                  )}
                  {!achievement.completed && (
                    <div className="text-xs text-gray-500 mt-1">
                      {achievement.progress} / {achievement.requirement}
                    </div>
                  )}
                </div>
              </div>
              <div>
                {achievement.completed && !achievement.rewardClaimed ? (
                  <Button
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => onClaimReward(achievement.id)}
                  >
                    <Coins className="h-4 w-4" />
                    <span>+{achievement.rewardAmount}</span>
                  </Button>
                ) : achievement.completed ? (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Claimed</span>
                ) : (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {Math.round((achievement.progress / achievement.requirement) * 100)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Achievements;
