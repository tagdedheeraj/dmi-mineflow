
// This file now just re-exports all reward services for backward compatibility
// New code should import from the specific modules or from '@/lib/rewards'

// Re-export everything from the rewards modules
export * from './rewards/dateUtils';
export * from './rewards/rewardsTracking';
export * from './rewards/taskManagement';

// Import and re-export from usdtEarnings to avoid conflicts
import * as UsdtEarningsModule from './rewards/usdtEarnings';
export const { 
  recordUsdtTransaction,
  getUserUsdtTransactions
} = UsdtEarningsModule;

// Re-export from earningsUpdater
import { updateUsdtEarningsInternal } from './rewards/earningsUpdater';
export { updateUsdtEarningsInternal };

export * from './rewards/referralCommissions';
export * from './rewards/claimableRewards';
