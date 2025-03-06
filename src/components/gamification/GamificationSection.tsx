
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { 
  checkAndUpdateStreak, 
  getUserStreak, 
  getLeaderboard, 
  getUserAchievements, 
  claimAchievementReward,
  achievements as achievementsList
} from '@/lib/gamificationService';
import DailyStreak from './DailyStreak';
import Achievements from './Achievements';
import Leaderboard from './Leaderboard';
import { Trophy, Flame, Target } from 'lucide-react';

const GamificationSection: React.FC = () => {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [streak, setStreak] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState({
    streak: true,
    achievements: true,
    leaderboard: true
  });
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
        loadUserData(user.uid);
      } else {
        setUserId(null);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  const loadUserData = async (uid: string) => {
    try {
      // Check and update streak for today
      const streakData = await checkAndUpdateStreak(uid);
      setStreak(streakData);
      setLoading(prev => ({ ...prev, streak: false }));
      
      // Get achievements
      const userAchievements = await getUserAchievements(uid);
      setAchievements(userAchievements);
      setLoading(prev => ({ ...prev, achievements: false }));
      
      // Get leaderboard
      const leaderboardData = await getLeaderboard();
      setLeaderboard(leaderboardData);
      setLoading(prev => ({ ...prev, leaderboard: false }));
    } catch (error) {
      console.error("Error loading gamification data:", error);
      
      // Show error toast
      toast({
        title: "Failed to load rewards data",
        description: "Please try refreshing the page",
        variant: "destructive"
      });
      
      // Set loading to false for all items
      setLoading({
        streak: false,
        achievements: false,
        leaderboard: false
      });
    }
  };
  
  const handleClaimStreakReward = async () => {
    if (!userId || !streak) return;
    
    // Check which streak achievement to claim based on current streak
    let achievementId = '';
    
    if (streak.currentStreak >= 30) {
      achievementId = 'login_streak_30';
    } else if (streak.currentStreak >= 7) {
      achievementId = 'login_streak_7';
    } else if (streak.currentStreak >= 3) {
      achievementId = 'login_streak_3';
    }
    
    if (achievementId) {
      const reward = await claimAchievementReward(userId, achievementId);
      
      if (reward) {
        toast({
          title: "Streak Reward Claimed!",
          description: `You received ${reward} DMI coins for your login streak.`,
          variant: "default"
        });
        
        // Refresh achievements
        const userAchievements = await getUserAchievements(userId);
        setAchievements(userAchievements);
      } else {
        toast({
          title: "Already Claimed",
          description: "You've already claimed this streak reward.",
          variant: "default"
        });
      }
    }
  };
  
  const handleClaimAchievementReward = async (achievementId: string) => {
    if (!userId) return;
    
    const reward = await claimAchievementReward(userId, achievementId);
    
    if (reward) {
      const achievement = achievementsList.find(a => a.id === achievementId);
      
      toast({
        title: "Achievement Completed!",
        description: `You received ${reward} DMI coins for completing "${achievement?.title}".`,
        variant: "default"
      });
      
      // Refresh achievements
      const userAchievements = await getUserAchievements(userId);
      setAchievements(userAchievements);
    } else {
      toast({
        title: "Already Claimed",
        description: "You've already claimed this achievement reward.",
        variant: "default"
      });
    }
  };
  
  return (
    <div className="space-y-6 mt-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Trophy className="h-6 w-6 text-purple-500" />
        Gamification
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DailyStreak 
          streak={streak} 
          isLoading={loading.streak}
          onClaimReward={handleClaimStreakReward}
        />
        
        <Leaderboard 
          leaderboard={leaderboard}
          isLoading={loading.leaderboard}
          currentUserId={userId}
        />
      </div>
      
      <Achievements 
        achievements={achievementsList}
        userAchievements={achievements}
        isLoading={loading.achievements}
        onClaimReward={handleClaimAchievementReward}
      />
    </div>
  );
};

export default GamificationSection;
