
// Re-export all USDT earnings-related functions from the smaller modules
export * from './dateTracking';
export * from './planPurchaseManager';
export * from './earningsUpdater';
export * from './planPurchaseRewards';
export * from './dailyEarningsProcessor';
export * from './referralCommissions';

// Import and re-export addUsdtTransaction and functions that handle USDT transactions from firebase
import { addUsdtTransaction, getUserTransactions as getUserUsdtTransactions } from '../firebase';
export { addUsdtTransaction, getUserUsdtTransactions };

// Define the recordUsdtTransaction as an alias for addUsdtTransaction for backward compatibility
export const recordUsdtTransaction = addUsdtTransaction;
