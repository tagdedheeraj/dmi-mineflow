
// This file now just re-exports all reward services for backward compatibility
// New code should import from the specific modules or from '@/lib/rewards'

// Re-export everything from the rewards modules
export * from './rewards/dateUtils';
export * from './rewards/rewardsTracking';
export * from './rewards/taskManagement';

// Re-export from usdtEarnings
export * from './rewards/usdtEarnings';

// Re-export from earningsUpdater
export * from './rewards/earningsUpdater';

export * from './rewards/referralCommissions';
export * from './rewards/claimableRewards';

// Re-export from dateTracking and planPurchaseManager
export * from './rewards/dateTracking';
export * from './rewards/planPurchaseManager';

// Re-export from dailyEarningsProcessor
export * from './rewards/dailyEarningsProcessor';
