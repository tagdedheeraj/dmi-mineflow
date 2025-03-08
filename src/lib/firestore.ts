
// This file now re-exports all the functionality from the various services
// This maintains backward compatibility so that existing code doesn't break

// Auth service exports
export {
  getUser,
  saveUser,
  setUsdtAddress,
  getDeviceId,
  getDeviceRegistrations,
  saveDeviceRegistration,
  registerAccountOnDevice
} from './services/authService';

// Wallet service exports
export {
  updateUserBalance,
  updateUsdtEarnings,
  addUsdtTransaction
} from './services/walletService';

// Mining service exports
export {
  getCurrentMining,
  saveCurrentMining,
  clearCurrentMining,
  getMiningHistory,
  addToMiningHistory,
  checkAndUpdateMining
} from './services/miningService';

// Plan service exports
export {
  getActivePlans,
  saveActivePlan,
  getLastUsdtUpdateDate_deprecated as getLastUsdtUpdateDate,
  updateLastUsdtUpdateDate_deprecated as updateLastUsdtUpdateDate,
} from './services/planService';

// Referral service exports
export {
  generateReferralCode,
  saveReferralCode,
  applyReferralCode,
  getReferredUsers,
  getReferralStats,
  getReferralNetwork
} from './services/referralService';

// Settings service exports
export {
  getAppSettings,
  updateAppSettings
} from './services/settingsService';
