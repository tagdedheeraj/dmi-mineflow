
import { useState, useCallback, useEffect } from 'react';
import { MiningSession } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { getCurrentMining, saveCurrentMining, clearCurrentMining, addToMiningHistory } from '@/lib/firestore';

export const useMiningSession = (
  userId: string | undefined, 
  updateBalance: (balance: number) => void, 
  calculateRate: () => number
) => {
  const { toast } = useToast();
  const [currentMining, setCurrentMining] = useState<MiningSession | null>(null);
  const [isMining, setIsMining] = useState(false);
  
  // Set consistent mining duration to exactly 24 hours (in milliseconds)
  const MINING_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Load current mining session on mount
  useEffect(() => {
    const loadCurrentMining = async () => {
      if (!userId) return;
      
      try {
        console.log("Loading current mining session for user:", userId);
        const session = await getCurrentMining(userId);
        
        if (session) {
          console.log("Found active mining session:", session);
          
          // If the end time has passed, automatically complete the session
          const now = Date.now();
          if (now > session.endTime) {
            console.log("Mining session has ended, completing automatically");
            await completeSession(session);
          } else {
            setCurrentMining(session);
            setIsMining(true);
          }
        } else {
          console.log("No active mining session found");
          setCurrentMining(null);
          setIsMining(false);
        }
      } catch (error) {
        console.error("Error loading current mining session:", error);
      }
    };
    
    loadCurrentMining();
  }, [userId]);
  
  // Helper function to complete a mining session
  const completeSession = async (session: MiningSession) => {
    if (!userId) return;
    
    try {
      const now = Date.now();
      // Calculate earned coins based on the actual duration, capped at the end time
      const endTime = Math.min(now, session.endTime);
      const elapsedHours = (endTime - session.startTime) / (1000 * 60 * 60);
      const earnedCoins = Math.floor(elapsedHours * session.rate);
      
      const completedSession: MiningSession = {
        ...session,
        endTime: endTime,
        status: 'completed',
        earned: earnedCoins
      };
      
      if (session.id) {
        await clearCurrentMining(session.id);
      }
      await addToMiningHistory(userId, completedSession);
      
      if (earnedCoins > 0) {
        updateBalance(earnedCoins);
      }
      
      setCurrentMining(null);
      setIsMining(false);
      
      console.log(`Mining completed: Earned ${earnedCoins} DMI coins`);
      
      toast({
        title: "Mining Completed",
        description: `You've earned ${earnedCoins} DMI Coins.`,
      });
    } catch (error) {
      console.error("Error completing mining session:", error);
    }
  };

  // Force refresh mining state
  const forceRefreshMining = useCallback(async () => {
    if (!userId) return;
    
    try {
      console.log("Forcing mining session refresh");
      const session = await getCurrentMining(userId);
      
      if (session) {
        const now = Date.now();
        if (now > session.endTime) {
          await completeSession(session);
        } else {
          setCurrentMining(session);
          setIsMining(true);
        }
      } else {
        setCurrentMining(null);
        setIsMining(false);
      }
    } catch (error) {
      console.error("Error refreshing mining session:", error);
    }
  }, [userId]);

  const startMining = useCallback(async () => {
    if (!userId) return;
    
    try {
      console.log("Starting new mining session");
      
      // First, check if there's an existing session and complete it if needed
      const existingSession = await getCurrentMining(userId);
      if (existingSession) {
        console.log("Found existing session while starting. Completing it first.");
        await completeSession(existingSession);
      }
      
      const now = Date.now();
      const currentRate = calculateRate();
      
      const newSession: MiningSession = {
        id: '',
        startTime: now,
        endTime: now + MINING_DURATION,
        rate: currentRate,
        earned: 0,
        status: 'active'
      };
      
      console.log("Creating new mining session with duration:", MINING_DURATION / (60 * 60 * 1000), "hours");
      await saveCurrentMining(userId, newSession);
      const savedSession = await getCurrentMining(userId);
      
      if (savedSession) {
        setCurrentMining(savedSession);
        setIsMining(true);
        
        toast({
          title: "Mining Started",
          description: `Mining started at ${currentRate.toFixed(2)} DMI coins per hour.`,
        });
      }
    } catch (error) {
      console.error("Error starting mining:", error);
      toast({
        title: "Mining Failed",
        description: "Failed to start mining. Please try again.",
        variant: "destructive",
      });
    }
  }, [userId, calculateRate, toast]);

  const stopMining = useCallback(async () => {
    if (!userId || !currentMining) return;
    
    try {
      await completeSession(currentMining);
    } catch (error) {
      console.error("Error stopping mining:", error);
      toast({
        title: "Error",
        description: "Failed to stop mining. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentMining, userId]);

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
