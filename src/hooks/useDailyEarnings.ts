
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

  const checkAndProcessDailyEarnings = useCallback(async (plansData: any) => {
    if (!userId || activePlans.length === 0) return;
    
    console.log("Checking daily USDT earnings...");
    console.log("Current time (IST):", getISTTimeString(new Date()));
    
    try {
      const todayIST = getISTDateString(new Date());
      console.log("Today's date (IST):", todayIST);
      console.log("Last update date:", lastUsdtEarningsUpdate);
      
      if (lastUsdtEarningsUpdate !== todayIST) {
        console.log("Processing daily earnings because last update was not today (IST)");
        
        const result = await processDailyUsdtEarnings(userId, activePlans, plansData);
        
        if (result.success && result.totalAmount > 0) {
          const updatedUser = await getUser(userId);
          if (updatedUser) {
            updateUser(updatedUser);
            
            result.details.forEach(detail => {
              toast({
                title: `Daily Earnings from ${detail.planName}`,
                description: `$${detail.amount.toFixed(2)} USDT has been added to your balance.`,
              });
            });
            
            if (result.details.length > 1) {
              toast({
                title: "Total Daily Earnings Added!",
                description: `$${result.totalAmount.toFixed(2)} USDT has been added from all your mining plans.`,
              });
            }
            
            setLastUsdtEarningsUpdate(todayIST);
          }
        } else if (result.success) {
          setLastUsdtEarningsUpdate(todayIST);
        }
      } else {
        console.log("Earnings already processed for today (IST)");
      }
    } catch (error) {
      console.error("Error processing daily USDT earnings:", error);
    }
  }, [userId, activePlans, lastUsdtEarningsUpdate, toast, updateUser]);

  useEffect(() => {
    loadLastUpdateDate();
  }, [loadLastUpdateDate]);

  return {
    lastUsdtEarningsUpdate,
    dailyEarningsUpdateTime,
    checkAndProcessDailyEarnings,
    scheduleNextMidnight: (checkFn: () => void) => {
      const timeUntilMidnight = getTimeUntilMidnightIST();
      
      console.log(`Scheduled next USDT earnings update in ${Math.floor(timeUntilMidnight / 3600000)} hours and ${Math.floor((timeUntilMidnight % 3600000) / 60000)} minutes (at midnight IST)`);
      
      return setTimeout(() => {
        console.log("Midnight IST reached, processing USDT earnings...");
        checkFn();
      }, timeUntilMidnight);
    }
  };
};
