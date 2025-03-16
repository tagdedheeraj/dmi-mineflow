
import { useState, useEffect, useCallback } from 'react';
import { MiningSession } from '@/lib/storage';
import { 
  getCurrentMining,
  saveCurrentMining,
  checkAndUpdateMining,
  getUser
} from '@/lib/firebase';

export interface UseMiningSessionProps {
  userId: string | undefined;
  updateUserBalance: (balance: number) => Promise<void>;
  getMiningRate: () => number;
}

export const useMiningSession = (
  userId: string | undefined,
  updateUserBalance: (balance: number) => Promise<void>,
  getMiningRate: () => number
) => {
  const [currentMining, setCurrentMining] = useState<MiningSession | null>(null);
  const [isMining, setIsMining] = useState(false);

  // Load current mining session
  const loadCurrentMining = useCallback(async () => {
    if (!userId) return;
    
    try {
      console.log("[useMiningSession] Loading current mining session for user:", userId);
      const currentSession = await getCurrentMining(userId);
      
      if (currentSession) {
        console.log("[useMiningSession] Found active mining session:", currentSession);
        setCurrentMining(currentSession);
        setIsMining(currentSession.status === 'active');
      } else {
        console.log("[useMiningSession] No active mining session found");
        setCurrentMining(null);
        setIsMining(false);
      }
    } catch (error) {
      console.error("Error loading current mining:", error);
    }
  }, [userId]);

  // Check if mining should be completed and update user balance
  const checkMiningCompletion = useCallback(async () => {
    if (!userId) return;
    
    try {
      console.log("[useMiningSession] Checking if mining should be completed for user:", userId);
      
      // Get user's current balance before mining completion
      const userBefore = await getUser(userId);
      if (userBefore) {
        console.log(`[useMiningSession] User balance BEFORE mining completion: ${userBefore.balance} DMI`);
      }
      
      const { updatedSession, earnedCoins } = await checkAndUpdateMining(userId);
      
      if (updatedSession) {
        console.log("[useMiningSession] Mining session updated:", updatedSession);
        setCurrentMining(updatedSession);
        setIsMining(updatedSession.status === 'active');
        
        // If mining completed and earned coins
        if (updatedSession.status === 'completed' && earnedCoins > 0) {
          console.log(`[useMiningSession] Mining completed. Earned coins: ${earnedCoins}`);
          
          // Update user balance with earned coins
          await updateUserBalance(earnedCoins);
          
          // Get updated user to verify balance
          const updatedUser = await getUser(userId);
          if (updatedUser) {
            console.log(`[useMiningSession] User balance AFTER mining completion: ${updatedUser.balance} DMI`);
            
            // Calculate expected balance for verification
            const expectedBalance = (userBefore?.balance || 0) + earnedCoins;
            console.log(`[useMiningSession] Expected balance: ${expectedBalance} DMI`);
            
            if (updatedUser.balance !== expectedBalance) {
              console.warn(`[useMiningSession] Balance mismatch! Expected: ${expectedBalance}, Actual: ${updatedUser.balance}`);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error checking mining completion:", error);
    }
  }, [userId, updateUserBalance]);

  // Load mining on mount and when userId changes
  useEffect(() => {
    loadCurrentMining();
  }, [loadCurrentMining]);

  // Start mining
  const startMining = useCallback(async () => {
    if (!userId) return;
    
    try {
      console.log("[useMiningSession] Starting mining for user:", userId);
      
      // Check if user is already mining
      await checkMiningCompletion();
      
      if (currentMining?.status === 'active') {
        console.log("[useMiningSession] User is already mining");
        return;
      }
      
      // Calculate mining rate
      const rate = getMiningRate();
      
      // Create new mining session (4-hour duration)
      const now = Date.now();
      const duration = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
      
      const newSession: MiningSession = {
        startTime: now,
        endTime: now + duration,
        rate,
        earned: 0,
        status: 'active'
      };
      
      // Save mining session
      console.log("[useMiningSession] Creating new mining session:", newSession);
      await saveCurrentMining(userId, newSession);
      
      // Update state
      setCurrentMining(newSession);
      setIsMining(true);
    } catch (error) {
      console.error("Error starting mining:", error);
    }
  }, [userId, currentMining, checkMiningCompletion, getMiningRate]);

  // Stop mining
  const stopMining = useCallback(async () => {
    if (!userId || !currentMining || !currentMining.id) return;
    
    try {
      console.log("[useMiningSession] Stopping mining for user:", userId);
      
      // Update mining session status
      const updatedSession: MiningSession = {
        ...currentMining,
        status: 'completed'
      };
      
      // Save updated session
      await saveCurrentMining(userId, updatedSession);
      
      // Update state
      setCurrentMining(null);
      setIsMining(false);
    } catch (error) {
      console.error("Error stopping mining:", error);
    }
  }, [userId, currentMining]);

  // Force refresh mining state
  const forceRefreshMining = useCallback(async () => {
    console.log("[useMiningSession] Force refreshing mining state");
    await checkMiningCompletion();
    await loadCurrentMining();
  }, [checkMiningCompletion, loadCurrentMining]);

  return {
    currentMining,
    setCurrentMining,
    isMining,
    setIsMining,
    startMining,
    stopMining,
    forceRefreshMining
  };
};

export default useMiningSession;
