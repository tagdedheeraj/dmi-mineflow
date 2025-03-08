
// Aggregating exports from various reward-related modules
export * from './taskManagement';
export * from './referralCommissions';
export * from './usdtEarnings';
export * from './rewardsTracking';
export * from './dateUtils';
export * from './notificationService';

// Re-export functions needed by other components
export { 
  fetchTaskCompletions,
  registerTaskSubmission, 
  markTaskAsCompleted 
} from './taskManagement';
