import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { 
  getActivePlans, 
  saveActivePlan, 
  getCurrentMining, 
  saveCurrentMining, 
  clearCurrentMining 
} from '@/lib/firestore';
import { miningPlans } from '@/data/miningPlans';
import { useAuth } from './AuthContext';
import { addPlanPurchaseRewards } from '@/lib/rewards/usdtEarnings';
import { MiningSession, ActivePlan } from '@/lib/storage';

interface MiningContextType {
  miningRate: number;
  activePlans: ActivePlan[];
  dailyEarningsUpdateTime: string;
  startMining: () => Promise<void>;
  stopMining: () => Promise<void>;
  checkMiningStatus: () => Promise<void>;
  updateMiningBoost: (boostMultiplier: number, duration: number, planId: string) => Promise<boolean>;
}

const MiningContext = createContext<MiningContextType>({
  miningRate: 1,
  activePlans: [],
  dailyEarningsUpdateTime: "12:00 AM",
  startMining: async () => {},
  stopMining: async () => {},
  checkMiningStatus: async () => {},
  updateMiningBoost: async () => false,
});

export const useMining = () => useContext(MiningContext);

export const MiningProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [miningRate, setMiningRate] = useState<number>(1);
  const [activePlans, setActivePlans] = useState<ActivePlan[]>([]);
  const [dailyEarningsUpdateTime, setDailyEarningsUpdateTime] = useState<string>("12:00 AM");
  const { user, updateUser } = useAuth();

  useEffect(() => {
    if (user) {
      fetchActivePlans(user.id);
    }
  }, [user]);

  const fetchActivePlans = async (userId: string) => {
    try {
      const plans = await getActivePlans(userId);
      setActivePlans(plans);
      setMiningRate(calculateMiningRate(plans));
    } catch (error) {
      console.error("Error fetching active plans:", error);
    }
  };

  const calculateMiningRate = (plans: ActivePlan[]): number => {
    let totalBoost = plans.reduce((total, plan) => {
      if (new Date() < new Date(plan.expiresAt)) {
        return total * plan.boostMultiplier;
      }
      return total;
    }, 1);
    return totalBoost;
  };

  const startMining = async () => {
    if (!user) return;

    try {
      // Check if there's an existing active session
      const existingSession = await getCurrentMining(user.id);
      if (existingSession) {
        console.log("Mining already active");
        return;
      }

      const now = Date.now();
      const endTime = now + (6 * 60 * 60 * 1000); // 6 hours from now
      const newSession: MiningSession = {
        startTime: now,
        endTime: endTime,
        rate: miningRate,
        earned: 0,
        status: 'active'
      };

      await saveCurrentMining(user.id, newSession);
      console.log("Mining started successfully");
    } catch (error) {
      console.error("Error starting mining:", error);
    }
  };

  const stopMining = async () => {
    if (!user) return;

    try {
      const currentSession = await getCurrentMining(user.id);
      if (!currentSession) {
        console.log("No active mining session found");
        return;
      }

      const now = Date.now();
      const elapsedHours = (now - currentSession.startTime) / (1000 * 60 * 60);
      const earnedCoins = Math.floor(elapsedHours * currentSession.rate);

      const updatedSession: MiningSession = {
        ...currentSession,
        endTime: now,
        earned: earnedCoins,
        status: 'completed'
      };

      if (currentSession.id) {
        await clearCurrentMining(currentSession.id);
      }

      await saveCurrentMining(user.id, updatedSession);
      if (user.balance !== undefined) {
        const newBalance = user.balance + earnedCoins;
        updateUser({ ...user, balance: newBalance });
      }
      console.log("Mining stopped successfully");
    } catch (error) {
      console.error("Error stopping mining:", error);
    }
  };

  const checkMiningStatus = async () => {
    if (!user) return;

    try {
      const currentSession = await getCurrentMining(user.id);
      if (currentSession) {
        const now = Date.now();
        if (now >= currentSession.endTime) {
          // Auto-stop mining if the end time has passed
          await stopMining();
        }
      }
    } catch (error) {
      console.error("Error checking mining status:", error);
    }
  };

  const updateMiningBoost = async (boostMultiplier: number, duration: number, planId: string): Promise<boolean> => {
    try {
      if (!user) return false;
      
      console.log(`Updating mining boost: boostMultiplier=${boostMultiplier}, duration=${duration}, planId=${planId}`);
      
      // Find plan details
      const planDetails = miningPlans.find(p => p.id === planId);
      if (!planDetails) {
        console.error(`Plan ${planId} not found in miningPlans`);
        return false;
      }
      
      // Calculate expiration date (duration in days)
      const now = new Date();
      const expirationDate = new Date();
      expirationDate.setDate(now.getDate() + duration);
      
      // Create new active plan
      const newPlan: ActivePlan = {
        id: planId,
        boostMultiplier,
        startDate: now.toISOString(),
        expiresAt: expirationDate.toISOString(),
        active: true
      };
      
      // Save to firestore
      await saveActivePlan(user.id, newPlan);
      
      // Update local state
      setActivePlans(prevPlans => [...prevPlans, newPlan]);
      
      // Process immediate rewards: first day earnings + referral commission
      console.log(`Processing plan purchase rewards: dailyEarnings=${planDetails.dailyEarnings}, planCost=${planDetails.price}`);
      await addPlanPurchaseRewards(
        user.id, 
        planDetails.price, 
        planDetails.dailyEarnings, 
        planId
      );
      
      // Calculate new mining rate with the added boost
      const updatedBoost = calculateMiningRate([...activePlans, newPlan]);
      console.log(`New mining rate: ${updatedBoost}`);
      setMiningRate(updatedBoost);
      
      return true;
    } catch (error) {
      console.error("Error updating mining boost:", error);
      return false;
    }
  };

  return (
    <MiningContext.Provider
      value={{
        miningRate,
        activePlans,
        dailyEarningsUpdateTime,
        startMining,
        stopMining,
        checkMiningStatus,
        updateMiningBoost,
      }}
    >
      {children}
    </MiningContext.Provider>
  );
};
