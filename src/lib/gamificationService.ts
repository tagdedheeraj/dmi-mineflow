
import { db, auth } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  increment, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { getTodayDateKey } from './rewardsService';

// Streak management
export interface UserStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string;
  streakHistory: string[]; // Array of date strings when user logged in
}

// Achievement types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  rewardAmount: number;
}

// User achievement progress
export interface UserAchievement {
  achievementId: string;
  progress: number;
  completed: boolean;
  dateCompleted?: string;
  rewardClaimed: boolean;
}

// Leaderboard entry
export interface LeaderboardEntry {
  userId: string;
  userName: string;
  profilePic?: string;
  miningTotal: number;
  rank?: number;
}

// Predefined achievements
export const achievements: Achievement[] = [
  {
    id: 'login_streak_3',
    title: '3-Day Streak',
    description: 'Log in for 3 consecutive days',
    icon: 'flame',
    requirement: 3,
    rewardAmount: 50
  },
  {
    id: 'login_streak_7',
    title: 'Weekly Warrior',
    description: 'Log in for 7 consecutive days',
    icon: 'flame',
    requirement: 7,
    rewardAmount: 150
  },
  {
    id: 'login_streak_30',
    title: 'Monthly Master',
    description: 'Log in for 30 consecutive days',
    icon: 'flame',
    requirement: 30,
    rewardAmount: 800
  },
  {
    id: 'mining_total_1000',
    title: 'Mining Apprentice',
    description: 'Mine 1,000 DMI coins total',
    icon: 'pick',
    requirement: 1000,
    rewardAmount: 100
  },
  {
    id: 'mining_total_10000',
    title: 'Mining Expert',
    description: 'Mine 10,000 DMI coins total',
    icon: 'pick',
    requirement: 10000,
    rewardAmount: 500
  },
  {
    id: 'referrals_3',
    title: 'Friendly Recruiter',
    description: 'Refer 3 friends who join',
    icon: 'users',
    requirement: 3,
    rewardAmount: 300
  },
  {
    id: 'watch_ads_50',
    title: 'Ad Enthusiast',
    description: 'Watch 50 ads total',
    icon: 'video',
    requirement: 50,
    rewardAmount: 150
  }
];

// Check and update user login streak
export const checkAndUpdateStreak = async (userId: string): Promise<UserStreak> => {
  try {
    const todayKey = getTodayDateKey();
    const streakRef = doc(db, 'user_streaks', userId);
    const streakDoc = await getDoc(streakRef);
    
    if (streakDoc.exists()) {
      const streakData = streakDoc.data() as UserStreak;
      const lastLoginDate = streakData.lastLoginDate;
      
      // If already logged in today, return current streak
      if (lastLoginDate === todayKey) {
        return streakData;
      }
      
      // Calculate date difference to determine if streak continues
      const lastDate = new Date(lastLoginDate.replace(/-/g, '/'));
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let newStreakCount = 0;
      
      // If logged in yesterday, increment streak
      if (diffDays === 1) {
        newStreakCount = streakData.currentStreak + 1;
      } else {
        // Streak broken
        newStreakCount = 1;
      }
      
      const longestStreak = Math.max(newStreakCount, streakData.longestStreak);
      const updatedStreak = {
        ...streakData,
        currentStreak: newStreakCount,
        longestStreak,
        lastLoginDate: todayKey,
        streakHistory: [...streakData.streakHistory, todayKey]
      };
      
      await updateDoc(streakRef, updatedStreak);
      
      // Check for streak achievements
      if (newStreakCount === 3 || newStreakCount === 7 || newStreakCount === 30) {
        await checkAndUpdateAchievement(userId, `login_streak_${newStreakCount}`, newStreakCount);
      }
      
      return updatedStreak;
    } else {
      // First login, create new streak record
      const newStreak: UserStreak = {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastLoginDate: todayKey,
        streakHistory: [todayKey]
      };
      
      await setDoc(streakRef, newStreak);
      return newStreak;
    }
  } catch (error) {
    console.error("Error checking and updating streak:", error);
    return {
      userId,
      currentStreak: 0,
      longestStreak: 0,
      lastLoginDate: '',
      streakHistory: []
    };
  }
};

// Get user streak data
export const getUserStreak = async (userId: string): Promise<UserStreak | null> => {
  try {
    const streakRef = doc(db, 'user_streaks', userId);
    const streakDoc = await getDoc(streakRef);
    
    if (streakDoc.exists()) {
      return streakDoc.data() as UserStreak;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user streak:", error);
    return null;
  }
};

// Get user achievements
export const getUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
  try {
    const achievementsRef = collection(db, 'user_achievements');
    const q = query(achievementsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Initialize achievements for new user
      const initialAchievements: UserAchievement[] = achievements.map(achievement => ({
        achievementId: achievement.id,
        progress: 0,
        completed: false,
        rewardClaimed: false
      }));
      
      for (const achievement of initialAchievements) {
        await setDoc(doc(achievementsRef), {
          userId,
          ...achievement
        });
      }
      
      return initialAchievements;
    }
    
    return querySnapshot.docs.map(doc => doc.data() as UserAchievement);
  } catch (error) {
    console.error("Error getting user achievements:", error);
    return [];
  }
};

// Check and update achievement progress
export const checkAndUpdateAchievement = async (
  userId: string,
  achievementId: string,
  progress: number
): Promise<boolean> => {
  try {
    const achievementsRef = collection(db, 'user_achievements');
    const q = query(
      achievementsRef,
      where("userId", "==", userId),
      where("achievementId", "==", achievementId)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const achievementDoc = querySnapshot.docs[0];
      const achievementData = achievementDoc.data() as UserAchievement;
      
      // Skip if already completed
      if (achievementData.completed) {
        return false;
      }
      
      const achievement = achievements.find(a => a.id === achievementId);
      
      if (!achievement) {
        return false;
      }
      
      // Check if the achievement is now completed
      const completed = progress >= achievement.requirement;
      
      await updateDoc(achievementDoc.ref, {
        progress,
        completed,
        dateCompleted: completed ? getTodayDateKey() : undefined
      });
      
      return completed;
    } else {
      // Create a new achievement record
      const achievement = achievements.find(a => a.id === achievementId);
      
      if (!achievement) {
        return false;
      }
      
      const completed = progress >= achievement.requirement;
      
      await setDoc(doc(achievementsRef), {
        userId,
        achievementId,
        progress,
        completed,
        dateCompleted: completed ? getTodayDateKey() : undefined,
        rewardClaimed: false
      });
      
      return completed;
    }
  } catch (error) {
    console.error(`Error updating achievement ${achievementId}:`, error);
    return false;
  }
};

// Claim achievement reward
export const claimAchievementReward = async (
  userId: string,
  achievementId: string
): Promise<number | null> => {
  try {
    const achievementsRef = collection(db, 'user_achievements');
    const q = query(
      achievementsRef,
      where("userId", "==", userId),
      where("achievementId", "==", achievementId)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const achievementDoc = querySnapshot.docs[0];
      const achievementData = achievementDoc.data() as UserAchievement;
      
      // Check if it's completed and not claimed
      if (achievementData.completed && !achievementData.rewardClaimed) {
        const achievement = achievements.find(a => a.id === achievementId);
        
        if (!achievement) {
          return null;
        }
        
        // Mark as claimed
        await updateDoc(achievementDoc.ref, {
          rewardClaimed: true
        });
        
        // Update user balance
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          balance: increment(achievement.rewardAmount)
        });
        
        // Log the reward
        const rewardsLogRef = collection(db, 'rewards_log');
        await setDoc(doc(rewardsLogRef), {
          userId,
          type: 'achievement',
          achievementId,
          amount: achievement.rewardAmount,
          timestamp: Date.now()
        });
        
        return achievement.rewardAmount;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error claiming achievement reward for ${achievementId}:`, error);
    return null;
  }
};

// Get leaderboard data with fake data for now
export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    // For now, return fake leaderboard data
    const fakeLeaderboard: LeaderboardEntry[] = [
      {
        userId: 'user1',
        userName: 'CryptoKing',
        miningTotal: 56789,
        rank: 1
      },
      {
        userId: 'user2',
        userName: 'MiningMaster',
        miningTotal: 45678,
        rank: 2
      },
      {
        userId: 'user3',
        userName: 'DMILegend',
        miningTotal: 34567,
        rank: 3
      },
      {
        userId: 'user4',
        userName: 'CoinHunter',
        miningTotal: 23456,
        rank: 4
      },
      {
        userId: 'user5',
        userName: 'WealthBuilder',
        miningTotal: 12345,
        rank: 5
      },
      {
        userId: 'user6',
        userName: 'BitMiner',
        miningTotal: 9876,
        rank: 6
      },
      {
        userId: 'user7',
        userName: 'TokenCollector',
        miningTotal: 8765,
        rank: 7
      },
      {
        userId: 'user8',
        userName: 'CryptoNinja',
        miningTotal: 7654,
        rank: 8
      },
      {
        userId: 'user9',
        userName: 'BlockchainPro',
        miningTotal: 6543,
        rank: 9
      },
      {
        userId: 'user10',
        userName: 'DigiMiner',
        miningTotal: 5432,
        rank: 10
      }
    ];
    
    /* Later we'll implement real leaderboard
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('balance', 'desc'), limit(10));
    const querySnapshot = await getDocs(q);
    
    const leaderboard = querySnapshot.docs.map((doc, index) => {
      const userData = doc.data();
      return {
        userId: doc.id,
        userName: userData.fullName || 'Anonymous User',
        miningTotal: userData.balance || 0,
        rank: index + 1
      };
    });
    */
    
    return fakeLeaderboard;
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    return [];
  }
};
