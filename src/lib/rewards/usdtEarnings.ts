
// Main file that re-exports all earnings-related functionality

import { getLastUsdtUpdateDate, updateLastUsdtUpdateDate } from './earnings/dateTracking';
import { updateUsdtEarnings } from './earnings/earningsUpdater';
import { processDailyUsdtEarnings } from './earnings/dailyEarningsProcessor';
import { addPlanPurchaseRewards, wasPlanPurchasedToday, markPlanAsPurchasedToday } from './earnings/planPurchaseManager';
import { getTodayDateKey, convertToIST, getISTTimeString } from './earnings/dateUtils';

// Re-export all functions
export {
  // Date tracking
  getLastUsdtUpdateDate,
  updateLastUsdtUpdateDate,
  
  // Date utilities
  getTodayDateKey,
  convertToIST,
  getISTTimeString,
  
  // Plan purchase management
  wasPlanPurchasedToday,
  markPlanAsPurchasedToday,
  addPlanPurchaseRewards,
  
  // Earnings updates
  updateUsdtEarnings,
  
  // Daily earnings processing
  processDailyUsdtEarnings
};
