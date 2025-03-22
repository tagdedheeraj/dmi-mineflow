
import { useState, useEffect, useCallback } from 'react';
import { ActivePlan } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { getISTDateString, getISTTimeString, getTimeUntilMidnightIST } from '@/lib/mining/dateUtils';
import { processDailyUsdtEarnings } from '@/lib/rewards/dailyEarningsProcessor';
import { getLastUsdtUpdateDate } from '@/lib/rewards/dateTracking';
import { getUser } from '@/lib/firestore';

export const useDailyEarnings = (
  userId: string | undefined, 
  activePlans: ActivePlan[], 
  updateUser: (user: any) => void
) => {
  const { toast } = useToast();
  const [lastUsdtEarningsUpdate, setLastUsdtEarningsUpdate] = useState<string | null>(null);
  const dailyEarningsUpdateTime = "Manual Claim";

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

  const checkAndProcessDailyEarnings = useCallback(async (plansData: any) => {
    if (!userId || activePlans.length === 0) return;
    
    console.log("Checking daily USDT earnings availability...");
    console.log("Current time (IST):", getISTTimeString(new Date()));
    
    try {
      const result = await processDailyUsdtEarnings(userId, activePlans, plansData);
      
      if (result.success && result.details.length > 0) {
        // We're not automatically adding earnings anymore, just logging
        console.log(`User has ${result.details.length} plans eligible for claims, totaling ${result.totalAmount} USDT`);
        
        // Instead of updating directly, we could show a notification guiding the user to the wallet
        if (result.details.length > 0) {
          toast({
            title: "USDT Earnings Available",
            description: `You have $${result.totalAmount.toFixed(2)} USDT available to claim from your active plans. Visit your wallet to claim them.`,
          });
        }
      }
    } catch (error) {
      console.error("Error checking daily USDT earning availability:", error);
    }
  }, [userId, activePlans, toast]);

  useEffect(() => {
    loadLastUpdateDate();
  }, [loadLastUpdateDate]);

  return {
    lastUsdtEarningsUpdate,
    dailyEarningsUpdateTime,
    checkAndProcessDailyEarnings,
    scheduleNextMidnight: (checkFn: () => void) => {
      const timeUntilMidnight = getTimeUntilMidnightIST();
      
      console.log(`Scheduled check for claimable earnings in ${Math.floor(timeUntilMidnight / 3600000)} hours and ${Math.floor((timeUntilMidnight % 3600000) / 60000)} minutes (at midnight IST)`);
      
      return setTimeout(() => {
        console.log("Midnight IST reached, checking claimable USDT earnings...");
        checkFn();
      }, timeUntilMidnight);
    }
  };
};
