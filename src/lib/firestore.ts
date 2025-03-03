
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  increment, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  serverTimestamp,
  collection
} from "firebase/firestore";
import { 
  db, 
  usersCollection, 
  miningSessionsCollection, 
  deviceRegistrationsCollection, 
  plansCollection 
} from "./firebase";
import type { User, MiningSession, ActivePlan, DeviceRegistration } from './storage';

// User operations
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

export const saveUser = async (user: User): Promise<void> => {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, user, { merge: true });
  } catch (error) {
    console.error("Error saving user:", error);
  }
};

export const updateUserBalance = async (userId: string, amount: number): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      balance: increment(amount)
    });
    
    // Fetch and return the updated user
    return await getUser(userId);
  } catch (error) {
    console.error("Error updating user balance:", error);
    return null;
  }
};

export const setUsdtAddress = async (userId: string, address: string): Promise<User | null> => {
  try {
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

export const updateUsdtEarnings = async (userId: string, amount: number): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      usdtEarnings: increment(amount)
    });
    
    // Fetch and return the updated user
    return await getUser(userId);
  } catch (error) {
    console.error("Error updating USDT earnings:", error);
    return null;
  }
};

// Device registration operations
export const getDeviceRegistrations = async (deviceId: string): Promise<DeviceRegistration | null> => {
  try {
    const q = query(deviceRegistrationsCollection, where("deviceId", "==", deviceId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as DeviceRegistration;
    }
    return null;
  } catch (error) {
    console.error("Error fetching device registrations:", error);
    return null;
  }
};

export const saveDeviceRegistration = async (registration: DeviceRegistration): Promise<void> => {
  try {
    const q = query(deviceRegistrationsCollection, where("deviceId", "==", registration.deviceId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Update existing registration
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        deviceId: registration.deviceId,
        accountIds: registration.accountIds,
        firstAccountCreatedAt: registration.firstAccountCreatedAt
      });
    } else {
      // Create new registration
      await addDoc(deviceRegistrationsCollection, {
        deviceId: registration.deviceId,
        accountIds: registration.accountIds,
        firstAccountCreatedAt: registration.firstAccountCreatedAt
      });
    }
  } catch (error) {
    console.error("Error saving device registration:", error);
  }
};

export const registerAccountOnDevice = async (deviceId: string, userId: string): Promise<{ 
  isMultipleAccount: boolean,
  within24Hours: boolean 
}> => {
  try {
    // Get existing registration or create a new one
    let deviceRegistration = await getDeviceRegistrations(deviceId);
    
    if (!deviceRegistration) {
      deviceRegistration = {
        deviceId,
        accountIds: [],
        firstAccountCreatedAt: Date.now()
      };
    }
    
    // Add the account ID if it's not already registered
    if (!deviceRegistration.accountIds.includes(userId)) {
      deviceRegistration.accountIds.push(userId);
    }
    
    // If this is the first account on this device, update the creation time
    if (deviceRegistration.accountIds.length === 1) {
      deviceRegistration.firstAccountCreatedAt = Date.now();
    }
    
    await saveDeviceRegistration(deviceRegistration);
    
    const isMultipleAccount = deviceRegistration.accountIds.length > 1;
    const timeSinceFirstAccount = Date.now() - deviceRegistration.firstAccountCreatedAt;
    const within24Hours = timeSinceFirstAccount < 24 * 60 * 60 * 1000;
    
    return {
      isMultipleAccount,
      within24Hours
    };
  } catch (error) {
    console.error("Error registering account on device:", error);
    return {
      isMultipleAccount: false,
      within24Hours: false
    };
  }
};

// Mining operations
export const getCurrentMining = async (userId: string): Promise<MiningSession | null> => {
  try {
    const q = query(
      miningSessionsCollection, 
      where("userId", "==", userId),
      where("status", "==", "active")
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data() as MiningSession;
      data.id = querySnapshot.docs[0].id;
      return data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching current mining:", error);
    return null;
  }
};

export const saveCurrentMining = async (userId: string, session: MiningSession): Promise<void> => {
  try {
    // Include user ID in the session data
    const sessionWithUserId = { ...session, userId };
    
    if (session.id) {
      // Update existing session
      const sessionRef = doc(db, 'mining_sessions', session.id);
      await updateDoc(sessionRef, {
        startTime: sessionWithUserId.startTime,
        endTime: sessionWithUserId.endTime,
        rate: sessionWithUserId.rate,
        earned: sessionWithUserId.earned,
        status: sessionWithUserId.status,
        userId: sessionWithUserId.userId
      });
    } else {
      // Create new session
      await addDoc(miningSessionsCollection, {
        startTime: sessionWithUserId.startTime,
        endTime: sessionWithUserId.endTime,
        rate: sessionWithUserId.rate,
        earned: sessionWithUserId.earned,
        status: sessionWithUserId.status,
        userId: sessionWithUserId.userId,
        createdAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Error saving current mining:", error);
  }
};

export const clearCurrentMining = async (sessionId: string): Promise<void> => {
  try {
    const sessionRef = doc(db, 'mining_sessions', sessionId);
    await updateDoc(sessionRef, {
      status: 'completed'
    });
  } catch (error) {
    console.error("Error clearing current mining:", error);
  }
};

export const getMiningHistory = async (userId: string): Promise<MiningSession[]> => {
  try {
    const q = query(
      miningSessionsCollection, 
      where("userId", "==", userId),
      where("status", "==", "completed")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as MiningSession;
      data.id = doc.id;
      return data;
    });
  } catch (error) {
    console.error("Error fetching mining history:", error);
    return [];
  }
};

export const addToMiningHistory = async (userId: string, session: MiningSession): Promise<void> => {
  try {
    await addDoc(miningSessionsCollection, {
      ...session,
      userId,
      status: 'completed',
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error adding to mining history:", error);
  }
};

// Plans operations
export const getActivePlans = async (userId: string): Promise<ActivePlan[]> => {
  try {
    const q = query(plansCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const now = new Date();
    return querySnapshot.docs
      .map(doc => {
        const data = doc.data() as ActivePlan;
        data.id = doc.id;
        return data;
      })
      .filter(plan => new Date(plan.expiresAt) > now);
  } catch (error) {
    console.error("Error fetching active plans:", error);
    return [];
  }
};

export const saveActivePlan = async (userId: string, plan: ActivePlan): Promise<void> => {
  try {
    await addDoc(plansCollection, {
      ...plan,
      userId,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error saving active plan:", error);
  }
};

// Check if mining should be active
export const checkAndUpdateMining = async (userId: string): Promise<{ 
  updatedSession: MiningSession | null,
  earnedCoins: number 
}> => {
  try {
    const currentSession = await getCurrentMining(userId);
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
      
      if (currentSession.id) {
        // Clear current mining and add to history
        await clearCurrentMining(currentSession.id);
      }
      
      // Add to history
      await addToMiningHistory(userId, completedSession);
      
      // Update user balance
      await updateUserBalance(userId, earnedCoins);
      
      return { updatedSession: completedSession, earnedCoins };
    }
    
    // Mining is still in progress
    return { updatedSession: currentSession, earnedCoins: 0 };
  } catch (error) {
    console.error("Error checking and updating mining:", error);
    return { updatedSession: null, earnedCoins: 0 };
  }
};

// Helper function to track daily earnings updates
export const getLastUsdtUpdateDate = async (userId: string): Promise<string | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && userDoc.data().lastUsdtEarningsUpdate) {
      return userDoc.data().lastUsdtEarningsUpdate;
    }
    return null;
  } catch (error) {
    console.error("Error getting last USDT update date:", error);
    return null;
  }
};

export const updateLastUsdtUpdateDate = async (userId: string, date: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastUsdtEarningsUpdate: date
    });
  } catch (error) {
    console.error("Error updating last USDT update date:", error);
  }
};

// Helper to get device ID (keeping local storage for this)
export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('dmi_device_id');
  
  if (!deviceId) {
    // Generate a unique ID for this device
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('dmi_device_id', deviceId);
  }
  
  return deviceId;
};
