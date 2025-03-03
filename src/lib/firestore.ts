
// This file is maintained for backwards compatibility
// It re-exports everything from the new modularized structure
export * from './firebase';

// Re-export specific functions from firebase modules
export { 
  getUser,
  saveUser,
  updateUserBalance
} from './firebase/users';

export {
  registerAccountOnDevice
} from './firebase/devices';

export {
  getCurrentMining,
  saveCurrentMining,
  clearCurrentMining,
  addToMiningHistory,
  checkAndUpdateMining,
  getActivePlans,
  saveActivePlan,
  updateUsdtEarnings,
  getLastUsdtUpdateDate,
  updateLastUsdtUpdateDate
} from './firebase/mining';

export {
  setUsdtAddress
} from './firebase/users';
