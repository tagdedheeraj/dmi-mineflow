
/**
 * User storage service to manage user data
 */
import { User, STORAGE_KEYS } from './types';
import { updateUsdtEarnings as updateFirestoreUsdtEarnings } from '@/lib/firestore';

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
  
  console.log(`Updating USDT earnings: Current: $${user.usdtEarnings || 0}, Adding: $${amount}`);
  
  // Initialize usdtEarnings if it doesn't exist
  if (user.usdtEarnings === undefined) {
    user.usdtEarnings = 0;
  }
  
  // Add the exact amount (daily earnings)
  user.usdtEarnings += amount;
  
  console.log(`New USDT earnings: $${user.usdtEarnings}`);
  
  // Update in localStorage
  saveUser(user);
  
  // Also update in Firebase
  if (user.id) {
    updateFirestoreUsdtEarnings(user.id, amount)
      .then(() => {
        console.log(`Firebase USDT earnings updated for user ${user.id}`);
      })
      .catch(error => {
        console.error("Error updating Firebase USDT earnings:", error);
      });
  }
  
  return user;
};

export const clearUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};
