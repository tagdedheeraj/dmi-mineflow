
// Re-export all USDT earnings-related functions from the smaller modules
export * from './dateTracking';
export * from './planPurchaseManager';
export * from './earningsUpdater';
export * from './planPurchaseRewards';
export * from './dailyEarningsProcessor';
export * from './referralCommissions';

// Import and re-export addUsdtTransaction and functions that handle USDT transactions from firebase
import { addUsdtTransaction, getUserTransactions } from '../firebase';
export { addUsdtTransaction };

// Define the getUserUsdtTransactions and recordUsdtTransaction as aliases for backward compatibility
export const getUserUsdtTransactions = getUserTransactions;
export const recordUsdtTransaction = addUsdtTransaction;
