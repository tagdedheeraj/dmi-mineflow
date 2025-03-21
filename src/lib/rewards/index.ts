
// Re-export all reward services from this central file
export * from './dateUtils';
export * from './rewardsTracking';
export * from './taskManagement';
export * from './referralCommissions';
export * from './notificationService';

// Export earningsUpdater separately to avoid ambiguous exports
import { updateUsdtEarningsInternal } from './earningsUpdater';
export { updateUsdtEarningsInternal };

// Export from usdtEarnings without the updateUsdtEarnings that would cause a conflict
import * as UsdtEarningsModule from './usdtEarnings';
export const { 
  recordUsdtTransaction,
  getUserUsdtTransactions
} = UsdtEarningsModule;

// Export the new claimable rewards functionality
export * from './claimableRewards';
