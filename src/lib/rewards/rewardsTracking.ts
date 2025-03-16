
import { 
  db, 
  auth,
} from '../firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  increment,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { getTodayDateKey } from './dateUtils';
import { User } from '../storage';

// Fetch rewards data for a user
export const fetchRewardsData = async (userId: string) => {
  try {
    const todayKey = getTodayDateKey();
    const rewardsRef = doc(db, 'rewards', `${userId}_${todayKey}`);
    const rewardsDoc = await getDoc(rewardsRef);
    
    if (rewardsDoc.exists()) {
      return rewardsDoc.data();
    } else {
      // Create a new document for today
      const newData = {
        userId,
        date: todayKey,
        adsWatched: 0,
        earnings: 0
      };
      
      await setDoc(rewardsRef, newData);
      return newData;
    }
  } catch (error) {
    console.error("Error fetching rewards data:", error);
    return null;
  }
};

// Update rewards data in Firestore
export const updateRewardsData = async (userId: string, adsWatched: number, earnings: number) => {
  try {
    const todayKey = getTodayDateKey();
    const rewardsRef = doc(db, 'rewards', `${userId}_${todayKey}`);
    
    await updateDoc(rewardsRef, {
      adsWatched,
      earnings
    });
    
    return true;
  } catch (error) {
    console.error("Error updating rewards data:", error);
    return false;
  }
};

// Update user balance - Uses increment() instead of setting the value
export const updateUserBalance = async (userId: string, amount: number): Promise<User | null> => {
  try {
    console.log(`[RewardsTracking] Updating user ${userId} balance by adding ${amount} DMI coins`);
    
    // First, get the current user data to log the before/after balance for debugging
    const userBefore = await getUser(userId);
    if (userBefore) {
      console.log(`[RewardsTracking] User balance BEFORE update: ${userBefore.balance} DMI`);
    }
    
    const userRef = doc(db, 'users', userId);
    
    // Use the increment() function from Firestore to add the amount to the existing balance
    await updateDoc(userRef, {
      balance: increment(amount)
    });
    
    // Fetch and return the updated user
    const userSnap = await getDoc(userRef);
    const updatedUser = userSnap.exists() ? userSnap.data() as User : null;
    
    if (updatedUser) {
      console.log(`[RewardsTracking] User balance AFTER update: ${updatedUser.balance} DMI (added ${amount})`);
    }
    
    return updatedUser;
  } catch (error) {
    console.error("Error updating user balance:", error);
    return null;
  }
};

// Get user data with enhanced logging
export const getUser = async (userId: string): Promise<User | null> => {
  try {
    console.log(`[RewardsTracking] Getting user data for userId: ${userId}`);
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data() as User;
      console.log(`[RewardsTracking] Retrieved user data. Balance: ${userData.balance} DMI coins`);
      return userData;
    }
    console.log(`[RewardsTracking] No user data found for userId: ${userId}`);
    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

// Get user by email
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    console.log(`[RewardsTracking] Searching for user with email: ${email}`);
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as User;
      userData.id = userDoc.id; // Make sure ID is included
      
      console.log(`[RewardsTracking] Found user: ${userData.fullName}, ID: ${userData.id}, Balance: ${userData.balance} DMI coins`);
      return userData;
    }
    
    console.log(`[RewardsTracking] No user found with email: ${email}`);
    return null;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
};

// Function to update user's USDT earnings
export const updateUsdtEarnings = async (userId: string, amount: number): Promise<User | null> => {
  try {
    console.log(`[RewardsTracking] Updating user ${userId} USDT earnings by ${amount}`);
    const userRef = doc(db, 'users', userId);
    
    // Use increment() function to properly add to existing USDT earnings
    await updateDoc(userRef, {
      usdtEarnings: increment(amount)
    });
    
    // Fetch and return the updated user
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() as User : null;
  } catch (error) {
    console.error("Error updating USDT earnings:", error);
    return null;
  }
};

// Function to set user's USDT address
export const setUsdtAddress = async (userId: string, address: string): Promise<User | null> => {
  try {
    console.log(`[RewardsTracking] Setting USDT address for user ${userId}: ${address}`);
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      usdtAddress: address
    });
    
    // Fetch and return the updated user
    return await getUser(userId);
  } catch (error) {
    console.error("Error setting USDT address:", error);
    return null;
  }
};
