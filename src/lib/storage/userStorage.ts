
/**
 * User storage service to manage user data
 */
import { User, STORAGE_KEYS } from './types';

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
  
  console.log(`Updating USDT earnings with amount: $${amount}`);
  user.usdtEarnings = (user.usdtEarnings || 0) + amount;
  saveUser(user);
  return user;
};

export const clearUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};
