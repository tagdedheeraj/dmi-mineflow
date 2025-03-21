
import { useState, useEffect, useCallback } from 'react';
import { ActivePlan } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { getISTDateString, getISTTimeString, getTimeUntilMidnightIST } from '@/lib/mining/dateUtils';
import { getLastUsdtUpdateDate } from '@/lib/rewards/dateTracking';
import { getUser } from '@/lib/firestore';

export const useDailyEarnings = (
  userId: string | undefined, 
  activePlans: ActivePlan[], 
  updateUser: (user: any) => void
) => {
  const { toast } = useToast();
  const [lastUsdtEarningsUpdate, setLastUsdtEarningsUpdate] = useState<string | null>(null);
  const dailyEarningsUpdateTime = "12:01 AM";

  const loadLastUpdateDate = useCallback(async () => {
    if (!userId) return;
    
    try {
      const lastUpdateDate = await getLastUsdtUpdateDate(userId);
      if (lastUpdateDate) {
        setLastUsdtEarningsUpdate(lastUpdateDate);
      }
    } catch (error) {
      console.error("Error loading last update date:", error);
    }
  }, [userId]);

  // The daily earnings no longer automatically update, 
  // as users now need to claim rewards manually
  const checkAndProcessDailyEarnings = useCallback(async (plansData: any) => {
    // This function is now a no-op as we no longer process earnings automatically
    console.log("Daily earnings are now claimed manually");
    return;
  }, []);

  useEffect(() => {
    loadLastUpdateDate();
  }, [loadLastUpdateDate]);

  return {
    lastUsdtEarningsUpdate,
    dailyEarningsUpdateTime,
    checkAndProcessDailyEarnings,
    scheduleNextMidnight: (checkFn: () => void) => {
      // This function is kept for backwards compatibility
      // but it doesn't schedule anything meaningful anymore
      return setTimeout(() => {}, 24 * 60 * 60 * 1000);
    }
  };
};
