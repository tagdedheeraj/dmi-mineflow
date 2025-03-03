
/**
 * Local storage service to persist user and mining data
 */

export interface User {
  id: string;
  fullName: string;
  email: string;
  balance: number;
  createdAt: number;
}

export interface MiningSession {
  startTime: number;
  endTime: number;
  rate: number;
  earned: number;
  status: 'active' | 'completed' | 'pending';
}

const STORAGE_KEYS = {
  USER: 'dmi_user',
  CURRENT_MINING: 'dmi_current_mining',
  MINING_HISTORY: 'dmi_mining_history',
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
  
  user.balance += amount;
  saveUser(user);
  return user;
};

export const clearUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER);
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
    
    // Update user balance
    updateUserBalance(earnedCoins);
    
    return { updatedSession: completedSession, earnedCoins };
  }
  
  // Mining is still in progress
  return { updatedSession: currentSession, earnedCoins: 0 };
};
