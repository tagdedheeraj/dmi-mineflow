
// Export all firestore functions from this central file
import { getDeviceId } from './deviceRegistration';

// User operations
export { 
  getUser,
  saveUser,
  updateUserBalance,
  setUsdtAddress,
  updateUsdtEarnings,
} from './userOperations';

// USDT transaction operations
export {
  addUsdtTransaction,
} from './usdtTransactions';

// Referral operations
export {
  generateReferralCode,
  saveReferralCode,
  applyReferralCode,
  getReferredUsers,
  getReferralStats,
  getReferralNetwork,
} from './referralOperations';

// Device registration operations
export {
  getDeviceRegistrations,
  saveDeviceRegistration,
  registerAccountOnDevice,
  getDeviceId,
} from './deviceRegistration';

// Mining operations
export {
  getCurrentMining,
  saveCurrentMining,
  clearCurrentMining,
  getMiningHistory,
  addToMiningHistory,
  checkAndUpdateMining,
} from './miningOperations';

// Plans operations
export {
  getActivePlans,
  saveActivePlan,
} from './planOperations';

// App settings
export {
  getAppSettings,
  updateAppSettings,
} from './appSettings';

// Helper functions for USDT earnings
export {
  getLastUsdtUpdateDate,
  updateLastUsdtUpdateDate,
} from './usdtOperations';
