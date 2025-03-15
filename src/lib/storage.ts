
/**
 * Local storage service to persist user and mining data
 */

export interface User {
  id: string;
  fullName: string;
  email: string;
  balance: number;
  createdAt: number;
  usdtAddress?: string;
  usdtEarnings?: number;
  deviceId?: string;
  suspended?: boolean;
  suspendedReason?: string;
  referralCode?: string;
  appliedReferralCode?: string;
  referredBy?: string;
}

export interface MiningSession {
  id?: string;  // Add the id property which can be optional (for new sessions)
  startTime: number;
  endTime: number;
  rate: number;
  earned: number;
  status: 'active' | 'completed' | 'pending';
}

export interface ActivePlan {
  id: string;
  name: string;  // Added plan name
  purchasedAt: string;
  expiresAt: string;
  boostMultiplier: number;
  duration: number;
  planCost: number;
}

export interface DeviceRegistration {
  deviceId: string;
  accountIds: string[];
  firstAccountCreatedAt: number;
}

const STORAGE_KEYS = {
  USER: 'dmi_user',
  CURRENT_MINING: 'dmi_current_mining',
  MINING_HISTORY: 'dmi_mining_history',
  ACTIVE_PLANS: 'dmi_active_plans',
  DEVICE_REGISTRATIONS: 'dmi_device_registrations',
};

// Generate a unique device ID
export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('dmi_device_id');
  
  if (!deviceId) {
    // Generate a unique ID for this device
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('dmi_device_id', deviceId);
  }
  
  return deviceId;
};

// User operations
export const getUser = (): User | null => {
  const userJson = localStorage.getItem(STORAGE_KEYS.USER);
  return userJson ? JSON.parse(userJson) : null;
};

export const saveUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const updateUserBalance = (amount: number): User | null => {
  const user = getUser();
  if (!user) return null;
  
  // Make sure we're adding to the existing balance, not replacing it
  console.log(`Updating user balance: ${user.balance} + ${amount} = ${user.balance + amount}`);
  user.balance += amount;
  saveUser(user);
  return user;
};

export const setUsdtAddress = (address: string): User | null => {
  const user = getUser();
  if (!user) return null;
  
  user.usdtAddress = address;
  saveUser(user);
  return user;
};

export const updateUsdtEarnings = (amount: number): User | null => {
  const user = getUser();
  if (!user) return null;
  
  user.usdtEarnings = (user.usdtEarnings || 0) + amount;
  saveUser(user);
  return user;
};

export const clearUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// Device registration operations
export const getDeviceRegistrations = (): DeviceRegistration[] => {
  const registrationsJson = localStorage.getItem(STORAGE_KEYS.DEVICE_REGISTRATIONS);
  return registrationsJson ? JSON.parse(registrationsJson) : [];
};

export const saveDeviceRegistration = (registration: DeviceRegistration): void => {
  const registrations = getDeviceRegistrations();
  const existingIndex = registrations.findIndex(r => r.deviceId === registration.deviceId);
  
  if (existingIndex >= 0) {
    registrations[existingIndex] = registration;
  } else {
    registrations.push(registration);
  }
  
  localStorage.setItem(STORAGE_KEYS.DEVICE_REGISTRATIONS, JSON.stringify(registrations));
};

export const registerAccountOnDevice = (userId: string): { 
  isMultipleAccount: boolean,
  within24Hours: boolean 
} => {
  const deviceId = getDeviceId();
  const registrations = getDeviceRegistrations();
  const deviceRegistration = registrations.find(r => r.deviceId === deviceId) || {
    deviceId,
    accountIds: [],
    firstAccountCreatedAt: Date.now()
  };
  
  // Add the account ID if it's not already registered
  if (!deviceRegistration.accountIds.includes(userId)) {
    deviceRegistration.accountIds.push(userId);
  }
  
  // If this is the first account on this device, update the creation time
  if (deviceRegistration.accountIds.length === 1) {
    deviceRegistration.firstAccountCreatedAt = Date.now();
  }
  
  saveDeviceRegistration(deviceRegistration);
  
  const isMultipleAccount = deviceRegistration.accountIds.length > 1;
  const timeSinceFirstAccount = Date.now() - deviceRegistration.firstAccountCreatedAt;
  const within24Hours = timeSinceFirstAccount < 24 * 60 * 60 * 1000;
  
  return {
    isMultipleAccount,
    within24Hours
  };
};

// Mining operations
export const getCurrentMining = (): MiningSession | null => {
  const miningJson = localStorage.getItem(STORAGE_KEYS.CURRENT_MINING);
  return miningJson ? JSON.parse(miningJson) : null;
};

export const saveCurrentMining = (session: MiningSession): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_MINING, JSON.stringify(session));
};

export const clearCurrentMining = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_MINING);
};

export const getMiningHistory = (): MiningSession[] => {
  const historyJson = localStorage.getItem(STORAGE_KEYS.MINING_HISTORY);
  return historyJson ? JSON.parse(historyJson) : [];
};

export const addToMiningHistory = (session: MiningSession): void => {
  const history = getMiningHistory();
  history.push(session);
  localStorage.setItem(STORAGE_KEYS.MINING_HISTORY, JSON.stringify(history));
};

// Plans operations
export const getActivePlans = (): ActivePlan[] => {
  const plansJson = localStorage.getItem(STORAGE_KEYS.ACTIVE_PLANS);
  const plans = plansJson ? JSON.parse(plansJson) : [];
  
  // Filter out expired plans
  const now = new Date();
  return plans.filter((plan: ActivePlan) => new Date(plan.expiresAt) > now);
};

export const saveActivePlan = (plan: ActivePlan): void => {
  const plans = getActivePlans();
  plans.push(plan);
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PLANS, JSON.stringify(plans));
};

// Check if mining should be active
export const checkAndUpdateMining = (): { 
  updatedSession: MiningSession | null,
  earnedCoins: number 
} => {
  const currentSession = getCurrentMining();
  if (!currentSession || currentSession.status !== 'active') {
    return { updatedSession: null, earnedCoins: 0 };
  }

  const now = Date.now();
  
  // If mining period has completed
  if (now >= currentSession.endTime) {
    // Calculate exact earnings up to the end time
    const elapsedHours = (currentSession.endTime - currentSession.startTime) / (1000 * 60 * 60);
    const earnedCoins = Math.floor(elapsedHours * currentSession.rate);
    
    // Update session
    const completedSession: MiningSession = {
      ...currentSession,
      status: 'completed',
      earned: earnedCoins
    };
    
    // Clear current mining and add to history
    clearCurrentMining();
    addToMiningHistory(completedSession);
    
    // Update user balance - adding to existing balance
    console.log(`Mining complete. Adding ${earnedCoins} DMI coins to user balance.`);
    const user = getUser();
    if (user) {
      const oldBalance = user.balance;
      updateUserBalance(earnedCoins);
      console.log(`User balance updated: ${oldBalance} → ${user.balance + earnedCoins}`);
    }
    
    return { updatedSession: completedSession, earnedCoins };
  }
  
  // Mining is still in progress
  return { updatedSession: currentSession, earnedCoins: 0 };
};
