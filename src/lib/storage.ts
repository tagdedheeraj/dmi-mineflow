
import { User, MiningSession, ActivePlan, WithdrawalRequest } from "@/types";

// Function to get the user from local storage
export const getUser = (id?: string): User | null => {
  // If no ID provided, get from localStorage
  if (!id) {
    id = localStorage.getItem('userId') || '';
    if (!id) return null;
  }

  const usersJson = localStorage.getItem('users');
  if (!usersJson) return null;

  const users: User[] = JSON.parse(usersJson);
  return users.find(user => user.id === id) || null;
};

// Function to add a new user to local storage
export const addUser = (user: User): void => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));
};

// Function to save a user (replaces addUser in some context files)
export const saveUser = (user: User): void => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);

  if (index >= 0) {
    // Update existing user
    users[index] = user;
  } else {
    // Add new user
    users.push(user);
  }

  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('userId', user.id);
};

// Function to clear user session
export const clearUser = (): void => {
  localStorage.removeItem('userId');
};

// Function to get all users from local storage
export const getUsers = (): User[] => {
  const usersJson = localStorage.getItem('users');
  return usersJson ? JSON.parse(usersJson) : [];
};

// Function to update user information in local storage
export const updateUser = (updatedUser: User): User | null => {
  const users = getUsers();
  const index = users.findIndex(user => user.id === updatedUser.id);

  if (index === -1) {
    console.error('User not found');
    return null;
  }

  users[index] = updatedUser;
  localStorage.setItem('users', JSON.stringify(users));
  return updatedUser;
};

// Function to update user balance
export const updateUserBalance = (amount: number): User | null => {
  const userId = localStorage.getItem('userId');
  if (!userId) return null;

  const user = getUser(userId);
  if (!user) return null;

  user.balance = (user.balance || 0) + amount;
  updateUser(user);
  return user;
};

// Function to set the USDT address for a user
export const setUsdtAddress = (usdtAddress: string): User | null => {
  const userId = localStorage.getItem('userId');
  if (!userId) return null;

  const user = getUser(userId);
  if (!user) return null;

  user.usdtAddress = usdtAddress;
  updateUser(user);
  return user;
};

// Function to update USDT earnings for a user
export const updateUsdtEarnings = (earnings: number): User | null => {
  const userId = localStorage.getItem('userId');
  if (!userId) return null;

  const user = getUser(userId);
  if (!user) return null;

  user.usdtEarnings = (user.usdtEarnings || 0) + earnings;
  updateUser(user);
  return user;
};

// Function to create a withdrawal request
export const createWithdrawalRequest = (userId: string, amount: number, address: string): WithdrawalRequest => {
  const withdrawalRequests = getWithdrawalRequests();
  
  const newRequest: WithdrawalRequest = {
    id: Math.random().toString(36).substring(2, 15),
    userId,
    amount,
    address,
    status: 'pending',
    createdAt: Date.now(),
  };
  
  withdrawalRequests.push(newRequest);
  localStorage.setItem('withdrawal_requests', JSON.stringify(withdrawalRequests));
  
  // Deduct the amount from user's USDT earnings
  const user = getUser(userId);
  if (user) {
    user.usdtEarnings -= amount;
    updateUser(user);
  }
  
  return newRequest;
};

// Function to get all withdrawal requests
export const getWithdrawalRequests = (): WithdrawalRequest[] => {
  const requestsJson = localStorage.getItem('withdrawal_requests');
  return requestsJson ? JSON.parse(requestsJson) : [];
};

// Function to update a withdrawal request status
export const updateWithdrawalRequestStatus = (requestId: string, status: 'approved' | 'rejected'): WithdrawalRequest | null => {
  const withdrawalRequests = getWithdrawalRequests();
  const index = withdrawalRequests.findIndex(req => req.id === requestId);
  
  if (index === -1) return null;
  
  withdrawalRequests[index].status = status;
  withdrawalRequests[index].processedAt = Date.now();
  
  localStorage.setItem('withdrawal_requests', JSON.stringify(withdrawalRequests));
  return withdrawalRequests[index];
};

// Device ID management for preventing multiple accounts
export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('deviceId');
  
  if (!deviceId) {
    deviceId = `device_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('deviceId', deviceId);
  }
  
  return deviceId;
};

// Check if multiple accounts are being created from same device
export const registerAccountOnDevice = (userId: string): { isMultipleAccount: boolean; within24Hours: boolean } => {
  const deviceId = getDeviceId();
  const accountRegistry = localStorage.getItem('deviceAccounts') || '{}';
  const registry: Record<string, { userIds: string[], lastRegistration: number }> = JSON.parse(accountRegistry);
  
  if (!registry[deviceId]) {
    registry[deviceId] = {
      userIds: [],
      lastRegistration: Date.now()
    };
  }
  
  const device = registry[deviceId];
  const isMultipleAccount = device.userIds.length > 0;
  const within24Hours = Date.now() - device.lastRegistration < 24 * 60 * 60 * 1000;
  
  // Add this user ID to the device registry
  device.userIds.push(userId);
  device.lastRegistration = Date.now();
  
  localStorage.setItem('deviceAccounts', JSON.stringify(registry));
  
  return { isMultipleAccount, within24Hours };
};

// Mining Related Functions
export const getCurrentMining = (): MiningSession | null => {
  const miningJson = localStorage.getItem('current_mining');
  return miningJson ? JSON.parse(miningJson) : null;
};

export const saveCurrentMining = (session: MiningSession): void => {
  localStorage.setItem('current_mining', JSON.stringify(session));
};

export const clearCurrentMining = (): void => {
  localStorage.removeItem('current_mining');
};

export const addToMiningHistory = (session: MiningSession): void => {
  const historyJson = localStorage.getItem('mining_history');
  const history: MiningSession[] = historyJson ? JSON.parse(historyJson) : [];
  history.push(session);
  localStorage.setItem('mining_history', JSON.stringify(history));
};

export const checkAndUpdateMining = (): { updatedSession: MiningSession | null, earnedCoins: number } => {
  const currentMining = getCurrentMining();
  
  if (!currentMining) {
    return { updatedSession: null, earnedCoins: 0 };
  }
  
  const now = Date.now();
  
  // If mining session is complete but not processed
  if (now >= currentMining.endTime && currentMining.status === 'active') {
    const earnedCoins = Math.floor((currentMining.endTime - currentMining.startTime) / (1000 * 60 * 60) * currentMining.rate);
    
    // Update user balance
    updateUserBalance(earnedCoins);
    
    // Complete the mining session
    const completedSession: MiningSession = {
      ...currentMining,
      status: 'completed',
      earned: earnedCoins
    };
    
    // Update storage
    clearCurrentMining();
    addToMiningHistory(completedSession);
    
    return { updatedSession: null, earnedCoins };
  }
  
  return { updatedSession: currentMining, earnedCoins: 0 };
};

// Active Plans functions
export const getActivePlans = (): ActivePlan[] => {
  const plansJson = localStorage.getItem('active_plans');
  return plansJson ? JSON.parse(plansJson) : [];
};

export const saveActivePlan = (plan: ActivePlan): void => {
  const plans = getActivePlans();
  plans.push(plan);
  localStorage.setItem('active_plans', JSON.stringify(plans));
};
