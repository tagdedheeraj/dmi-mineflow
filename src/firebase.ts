
// Create this file to re-export the required functions from the original firestore.ts 
// that are needed by components we're not modifying right now.

import { 
  app, 
  auth, 
  analytics, 
  db,
  signInWithEmail,
  createUserWithEmail,
  signOutUser,
  usersCollection,
  miningSessionsCollection,
  deviceRegistrationsCollection,
  plansCollection
} from './lib/firebase';

// Re-export all the functions that were exported by firestore.ts
import {
  getUser,
  saveUser,
  updateUserBalance,
  setUsdtAddress,
  updateUsdtEarnings,
  getLastUsdtUpdateDate,
  updateLastUsdtUpdateDate,
  getCurrentMining,
  saveCurrentMining,
  clearCurrentMining,
  getMiningHistory,
  addToMiningHistory,
  checkAndUpdateMining,
  getActivePlans,
  saveActivePlan,
  getDeviceId,
  registerAccountOnDevice,
  generateReferralCode,
  saveReferralCode,
  applyReferralCode,
  getReferredUsers,
  addUsdtTransaction
} from './lib/firestore';

export {
  app,
  auth,
  analytics,
  db,
  signInWithEmail,
  createUserWithEmail,
  signOutUser,
  getUser,
  saveUser,
  updateUserBalance,
  setUsdtAddress,
  updateUsdtEarnings,
  getLastUsdtUpdateDate,
  updateLastUsdtUpdateDate,
  getCurrentMining,
  saveCurrentMining,
  clearCurrentMining,
  getMiningHistory,
  addToMiningHistory,
  checkAndUpdateMining,
  getActivePlans,
  saveActivePlan,
  getDeviceId,
  registerAccountOnDevice,
  generateReferralCode,
  saveReferralCode,
  applyReferralCode,
  getReferredUsers,
  addUsdtTransaction,
  usersCollection,
  miningSessionsCollection,
  deviceRegistrationsCollection,
  plansCollection
};
