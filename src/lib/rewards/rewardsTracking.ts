
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
  getDocs,
  orderBy,
  limit
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
    const userRef = doc(db, 'users', userId);
    
    // Use the increment() function from Firestore to add the amount to the existing balance
    await updateDoc(userRef, {
      balance: increment(amount)
    });
    
    // Fetch and return the updated user
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() as User : null;
  } catch (error) {
    console.error("Error updating user balance:", error);
    return null;
  }
};

// Get user data
export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as User;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

// Get reward sources summary
export const getRewardSourcesSummary = async (userId: string) => {
  try {
    // This would be implemented to aggregate data from different collections
    // For now, we return placeholder data
    return {
      dmi: {
        mining: 850,
        referrals: 250,
        tasks: 120,
        videos: 180
      },
      usdt: {
        mining: 8.5,
        referrals: 2.5,
        tasks: 1.2,
        videos: 0.7
      }
    };
  } catch (error) {
    console.error("Error getting reward sources summary:", error);
    return null;
  }
};
