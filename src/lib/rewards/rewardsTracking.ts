
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
    console.log(`[RewardsTracking] Updating user ${userId} balance by adding ${amount} DMI`);
    const userRef = doc(db, 'users', userId);
    
    // Get original balance for logging
    const userBefore = await getDoc(userRef);
    if (userBefore.exists()) {
      console.log(`[RewardsTracking] User balance before update: ${userBefore.data().balance} DMI`);
    }
    
    // Use the increment() function from Firestore to add the amount to the existing balance
    await updateDoc(userRef, {
      balance: increment(amount)
    });
    
    // Fetch and return the updated user
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data() as User;
      console.log(`[RewardsTracking] User balance after update: ${userData.balance} DMI`);
      return userData;
    }
    return null;
  } catch (error) {
    console.error("Error updating user balance:", error);
    return null;
  }
};

// Get user data with enhanced logging
export const getUser = async (userId: string): Promise<User | null> => {
  try {
    console.log(`Getting user data for userId: ${userId}`);
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data() as User;
      console.log(`Retrieved user data. Balance: ${userData.balance} DMI, USDT earnings: ${userData.usdtEarnings}`);
      return userData;
    }
    console.log(`No user data found for userId: ${userId}`);
    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

// Get user by email
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    console.log(`Searching for user with email: ${email}`);
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as User;
      userData.id = userDoc.id; // Make sure ID is included
      
      console.log(`Found user: ${userData.fullName}, ID: ${userData.id}, Balance: ${userData.balance}`);
      return userData;
    }
    
    console.log(`No user found with email: ${email}`);
    return null;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
};
