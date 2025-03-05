import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  User, 
  MiningSession, 
  ActivePlan 
} from './storage';

// Update a user's USDT earnings by ADDING the amount (not replacing)
export const updateUsdtEarnings = async (userId: string, amount: number): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data() as User;
      const currentUsdtEarnings = userData.usdtEarnings || 0;
      const newUsdtEarnings = currentUsdtEarnings + amount;
      
      await updateDoc(userRef, {
        usdtEarnings: newUsdtEarnings
      });
      
      // Return updated user data
      const updatedUser = {
        ...userData,
        usdtEarnings: newUsdtEarnings
      };
      
      return updatedUser;
    }
    
    return null;
  } catch (error) {
    console.error("Error updating USDT earnings:", error);
    return null;
  }
};

// Function to get a user document from Firestore
export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as User;
    } else {
      console.log("No such user!");
      return null;
    }
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
};

// Function to save a user document to Firestore
export const saveUser = async (user: User): Promise<void> => {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, user, { merge: true });
    console.log("User saved successfully!");
  } catch (error) {
    console.error("Error saving user:", error);
    throw error;
  }
};

// Function to update a user's USDT address
export const setUsdtAddress = async (userId: string, usdtAddress: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      usdtAddress: usdtAddress
    });
    
    // Fetch and return the updated user
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() as User : null;
  } catch (error) {
    console.error("Error setting USDT address:", error);
    return null;
  }
};

// Function to get the current mining session for a user
export const getCurrentMining = async (userId: string): Promise<MiningSession | null> => {
  try {
    const miningRef = doc(db, 'current_mining', userId);
    const miningSnap = await getDoc(miningRef);
    
    if (miningSnap.exists()) {
      return miningSnap.data() as MiningSession;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting current mining:", error);
    return null;
  }
};

// Function to save the current mining session for a user
export const saveCurrentMining = async (userId: string, miningSession: MiningSession): Promise<void> => {
  try {
    const miningRef = doc(db, 'current_mining', userId);
    await setDoc(miningRef, miningSession, { merge: true });
  } catch (error) {
    console.error("Error saving current mining:", error);
    throw error;
  }
};

// Function to clear the current mining session for a user
export const clearCurrentMining = async (miningId: string): Promise<void> => {
  try {
    const miningRef = doc(db, 'current_mining', miningId);
    await setDoc(miningRef, {});
  } catch (error) {
    console.error("Error clearing current mining:", error);
    throw error;
  }
};

// Function to add a mining session to the user's mining history
export const addToMiningHistory = async (userId: string, miningSession: MiningSession): Promise<void> => {
  try {
    const historyRef = collection(db, 'users', userId, 'mining_history');
    await addDoc(historyRef, miningSession);
  } catch (error) {
    console.error("Error adding to mining history:", error);
    throw error;
  }
};

// Function to check and update the mining session
export const checkAndUpdateMining = async (userId: string): Promise<{ updatedSession: MiningSession | null, earnedCoins: number }> => {
  try {
    const currentMiningSession = await getCurrentMining(userId);
    
    if (currentMiningSession && currentMiningSession.status === 'active') {
      const now = Date.now();
      if (now >= currentMiningSession.endTime) {
        // Mining session has ended
        const elapsedHours = (currentMiningSession.endTime - currentMiningSession.startTime) / (1000 * 60 * 60);
        const earnedCoins = Math.floor(elapsedHours * currentMiningSession.rate);
        
        return { updatedSession: null, earnedCoins };
      } else {
        // Mining session is still active
        return { updatedSession: currentMiningSession, earnedCoins: 0 };
      }
    } else {
      // No active mining session
      return { updatedSession: null, earnedCoins: 0 };
    }
  } catch (error) {
    console.error("Error checking and updating mining:", error);
    return { updatedSession: null, earnedCoins: 0 };
  }
};

// Function to get active plans for a user
export const getActivePlans = async (userId: string): Promise<ActivePlan[]> => {
  try {
    const plansRef = collection(db, 'users', userId, 'active_plans');
    const plansSnap = await getDocs(plansRef);
    
    const plans: ActivePlan[] = [];
    plansSnap.forEach(doc => {
      plans.push(doc.data() as ActivePlan);
    });
    
    return plans;
  } catch (error) {
    console.error("Error getting active plans:", error);
    return [];
  }
};

// Function to save an active plan for a user
export const saveActivePlan = async (userId: string, plan: ActivePlan): Promise<void> => {
  try {
    const plansRef = collection(db, 'users', userId, 'active_plans');
    
    // Use the plan ID as the document ID
    const planDocRef = doc(plansRef, plan.id);
    
    await setDoc(planDocRef, plan, { merge: true });
  } catch (error) {
    console.error("Error saving active plan:", error);
    throw error;
  }
};

// Function to get the last USDT update date for a user
export const getLastUsdtUpdateDate = async (userId: string): Promise<string | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data() as User;
      return userData.lastUsdtUpdateDate || null;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting last USDT update date:", error);
    return null;
  }
};

// Function to update the last USDT update date for a user
export const updateLastUsdtUpdateDate = async (userId: string, date: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastUsdtUpdateDate: date
    });
  } catch (error) {
    console.error("Error updating last USDT update date:", error);
    throw error;
  }
};

// Function to register an account on a device
export const registerAccountOnDevice = async (deviceId: string, accountId: string): Promise<{ isMultipleAccount: boolean; within24Hours: boolean }> => {
  try {
    const deviceRef = doc(db, 'devices', deviceId);
    const deviceSnap = await getDoc(deviceRef);
    
    let isMultipleAccount = false;
    let within24Hours = false;
    
    if (deviceSnap.exists()) {
      const deviceData = deviceSnap.data() as { accountIds: string[], lastRegistration: number };
      const accountIds = deviceData.accountIds || [];
      const lastRegistration = deviceData.lastRegistration || 0;
      
      isMultipleAccount = accountIds.length > 0;
      within24Hours = (Date.now() - lastRegistration) < (24 * 60 * 60 * 1000);
      
      // Update the device document with the new account ID and timestamp
      await updateDoc(deviceRef, {
        accountIds: [...accountIds, accountId],
        lastRegistration: serverTimestamp()
      });
    } else {
      // Create a new device document
      await setDoc(deviceRef, {
        accountIds: [accountId],
        lastRegistration: serverTimestamp()
      });
    }
    
    return { isMultipleAccount, within24Hours };
  } catch (error) {
    console.error("Error registering account on device:", error);
    return { isMultipleAccount: false, within24Hours: false };
  }
};
