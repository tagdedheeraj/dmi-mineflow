
import React, { 
  createContext, 
  useState, 
  useEffect, 
  useContext 
} from 'react';
import { useAuth } from './AuthContext';
import { 
  getCurrentMining, 
  saveCurrentMining, 
  clearCurrentMining, 
  checkAndUpdateMining,
  getActivePlans,
  saveActivePlan,
} from '@/lib/firestore';
import { 
  updateUsdtEarnings,
  updateLastUsdtUpdateDate
} from '@/lib/rewards/usdtEarnings';
import { MiningSession, ActivePlan } from '@/lib/storage';
import { getTodayDateKey } from '@/lib/rewards/dateUtils';
import { miningPlans } from '@/data/miningPlans';

export interface MiningContextType {
  miningRate: number;
  isMining: boolean;
  miningProgress: number;
  timeRemaining: number;
  currentEarnings: number;
  activePlans: Array<ActivePlan>;
  dailyEarningsUpdateTime: string;
  startMining: () => Promise<void>;
  stopMining: () => Promise<void>;
  checkMiningStatus: () => Promise<{
    isMining: boolean;
    earnedCoins: number;
  }>;
  updateMiningBoost: (
    boostMultiplier: number, 
    durationDays: number, 
    planId: string
  ) => Promise<boolean>;
}

export const MiningContext = createContext<MiningContextType>({
  miningRate: 1,
  isMining: false,
  miningProgress: 0,
  timeRemaining: 0,
  currentEarnings: 0,
  activePlans: [],
  dailyEarningsUpdateTime: "12:00 AM",
  startMining: async () => {},
  stopMining: async () => {},
  checkMiningStatus: async () => ({ isMining: false, earnedCoins: 0 }),
  updateMiningBoost: async () => false
});

export const MiningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [miningRate, setMiningRate] = useState<number>(1);
  const [isMining, setIsMining] = useState<boolean>(false);
  const [miningProgress, setMiningProgress] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [currentEarnings, setCurrentEarnings] = useState<number>(0);
  const [activePlans, setActivePlans] = useState<Array<ActivePlan>>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadActivePlans();
      checkMiningStatus();
    }
  }, [user]);

  const loadActivePlans = async () => {
    if (user) {
      const plans = await getActivePlans(user.id);
      setActivePlans(plans);
      
      // Calculate total boost from active plans
      const totalBoost = plans.reduce((total, plan) => {
        return total * plan.boostMultiplier;
      }, 1);
      
      setMiningRate(totalBoost);
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isMining) {
      intervalId = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 0) {
            clearInterval(intervalId);
            stopMining();
            return 0;
          }
          
          setMiningProgress(Math.min(100, miningProgress + (100 / (prevTime))));
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(intervalId);
  }, [isMining, miningProgress]);

  const startMining = async (): Promise<void> => {
    if (!user) return;
    
    const startTime = Date.now();
    const endTime = startTime + (24 * 60 * 60 * 1000); // 24 hours
    const rate = miningRate;
    
    const newSession: MiningSession = {
      startTime,
      endTime,
      rate,
      earned: 0,
      status: 'active'
    };
    
    await saveCurrentMining(user.id, newSession);
    
    setIsMining(true);
    setMiningProgress(0);
    setTimeRemaining(24 * 60 * 60);
    setCurrentEarnings(0);
  };

  const stopMining = async (): Promise<void> => {
    if (!user) return;
    
    const currentSession = await getCurrentMining(user.id);
    
    if (currentSession) {
      const now = Date.now();
      const elapsedHours = (now - currentSession.startTime) / (1000 * 60 * 60);
      const earnedCoins = Math.floor(elapsedHours * currentSession.rate);
      
      const completedSession: MiningSession = {
        ...currentSession,
        status: 'completed',
        endTime: now,
        earned: earnedCoins
      };
      
      if (currentSession.id) {
        await clearCurrentMining(currentSession.id);
      }
      
      setIsMining(false);
      setMiningProgress(0);
      setTimeRemaining(0);
      setCurrentEarnings(earnedCoins);
    }
  };

  const checkMiningStatus = async (): Promise<{
    isMining: boolean;
    earnedCoins: number;
  }> => {
    if (!user) return { isMining: false, earnedCoins: 0 };
    
    const { updatedSession, earnedCoins } = await checkAndUpdateMining(user.id);
    
    if (updatedSession) {
      setIsMining(updatedSession.status === 'active');
      
      if (updatedSession.status === 'active') {
        const remainingTime = Math.max(0, (updatedSession.endTime - Date.now()) / 1000);
        setTimeRemaining(remainingTime);
        setMiningProgress(0);
      } else {
        setTimeRemaining(0);
        setMiningProgress(100);
      }
      
      setCurrentEarnings(earnedCoins);
      return { isMining: updatedSession.status === 'active', earnedCoins };
    } else {
      setIsMining(false);
      setTimeRemaining(0);
      setMiningProgress(0);
      setCurrentEarnings(0);
      return { isMining: false, earnedCoins: 0 };
    }
  };

  // Function to update mining boost when a user buys a plan
  const updateMiningBoost = async (
    boostMultiplier: number, 
    durationDays: number, 
    planId: string
  ): Promise<boolean> => {
    try {
      if (!user) return false;
      
      console.log(`Updating mining boost: ${boostMultiplier}x for ${durationDays} days`);
      
      // Calculate expiration date
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + durationDays);
      
      // Prepare the plan data
      const newPlan = {
        id: planId,
        purchasedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        boostMultiplier: boostMultiplier,
        duration: durationDays
      };
      
      // Save the active plan to Firestore
      await saveActivePlan(user.id, newPlan);
      
      // Update local state
      setActivePlans(prevPlans => [...prevPlans, newPlan]);
      
      // Get plan details to calculate the first day's earnings
      const planInfo = miningPlans.find(p => p.id === planId);
      
      if (planInfo) {
        // Award first day's USDT earnings immediately
        // We don't need to get the referral commission here as it will be handled in updateUsdtEarnings
        await updateUsdtEarnings(user.id, planInfo.dailyEarnings, planId);
        
        // Update the last USDT update date to today to prevent double-counting in daily processing
        const todayDate = getTodayDateKey();
        await updateLastUsdtUpdateDate(user.id, todayDate);
        
        console.log(`First day's earnings of ${planInfo.dailyEarnings} USDT added for plan ${planId}`);
      }
      
      return true;
    } catch (error) {
      console.error("Error updating mining boost:", error);
      return false;
    }
  };

  return (
    <MiningContext.Provider value={{
      miningRate,
      isMining,
      miningProgress,
      timeRemaining,
      currentEarnings,
      activePlans,
      dailyEarningsUpdateTime: "12:00 PM (IST)",
      startMining,
      stopMining,
      checkMiningStatus,
      updateMiningBoost
    }}>
      {children}
    </MiningContext.Provider>
  );
};

export const useMining = () => useContext(MiningContext);
