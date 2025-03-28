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
  collection,
  doc as docRef
} from "firebase/firestore";
import { 
  db, 
  usersCollection, 
  miningSessionsCollection, 
  deviceRegistrationsCollection, 
  plansCollection 
} from "./firebase";
import type { User, MiningSession, ActivePlan, DeviceRegistration } from './storage';
import {
  REFERRAL_REWARD_COINS_LEVEL1,
  REFERRAL_REWARD_COINS_LEVEL2,
  REFERRAL_REWARD_COINS_LEVEL3,
  REFERRAL_REWARD_COINS_LEVEL4,
  REFERRAL_REWARD_COINS_LEVEL5,
  REFERRAL_REWARD_COINS_LEVEL1_PREMIUM,
  REFERRAL_REWARD_COINS_LEVEL2_PREMIUM,
  REFERRAL_REWARD_COINS_LEVEL3_PREMIUM,
  REFERRAL_REWARD_COINS_LEVEL4_PREMIUM,
  REFERRAL_REWARD_COINS_LEVEL5_PREMIUM,
  PREMIUM_PLAN_THRESHOLD,
  hasPremiumPlan
} from './rewards/referralCommissions';

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
    console.log(`[Firestore] Updating user ${userId} balance by adding ${amount} DMI coins`);
    const userRef = doc(db, 'users', userId);
    
    // First, get the current user data to log the before/after balance for debugging
    const userBefore = await getUser(userId);
    if (userBefore) {
      console.log(`[Firestore] User balance before update: ${userBefore.balance} DMI`);
    }
    
    // Use Firestore's increment() function to properly add to the existing balance
    await updateDoc(userRef, {
      balance: increment(amount)
    });
    
    // Fetch and return the updated user
    const updatedUser = await getUser(userId);
    if (updatedUser) {
      console.log(`[Firestore] User balance after update: ${updatedUser.balance} DMI`);
    }
    return updatedUser;
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

// USDT Transaction operations
export const addUsdtTransaction = async (
  userId: string,
  amount: number,
  type: 'deposit' | 'withdrawal' | 'refund' | 'bonus',
  description: string,
  timestamp: number
): Promise<void> => {
  try {
    const transactionsCollection = collection(db, 'usdt_transactions');
    await addDoc(transactionsCollection, {
      userId,
      amount,
      type,
      description,
      timestamp,
      createdAt: serverTimestamp()
    });
    
    console.log(`USDT transaction recorded for user ${userId}: ${type} ${amount}`);
  } catch (error) {
    console.error("Error adding USDT transaction:", error);
  }
};

// Referral operations
export const generateReferralCode = (userId: string): string => {
  // Generate a referral code based on userId and random characters
  const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `DMI${randomChars}`;
};

export const saveReferralCode = async (userId: string, code: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      referralCode: code
    });
  } catch (error) {
    console.error("Error saving referral code:", error);
  }
};

export const applyReferralCode = async (userId: string, referralCode: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Check if user has already applied a referral code
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return { success: false, message: "User not found." };
    }
    
    const userData = userSnap.data() as User;
    
    if (userData.appliedReferralCode) {
      return { success: false, message: "You have already applied a referral code." };
    }
    
    // Find the user who owns this referral code
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("referralCode", "==", referralCode));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: false, message: "Invalid referral code." };
    }
    
    const referrerDoc = querySnapshot.docs[0];
    const referrerId = referrerDoc.id;
    
    // Make sure user is not trying to refer themselves
    if (referrerId === userId) {
      return { success: false, message: "You cannot apply your own referral code." };
    }
    
    // Mark referral code as applied for this user
    await updateDoc(userRef, {
      appliedReferralCode: referralCode,
      referredBy: referrerId
    });
    
    // Check if referrer has premium plan status
    const isPremium = await hasPremiumPlan(referrerId);
    
    // Award the bonus to the referrer based on premium status (Level 1)
    const LEVEL1_BONUS = isPremium ? REFERRAL_REWARD_COINS_LEVEL1_PREMIUM : REFERRAL_REWARD_COINS_LEVEL1;
    await updateUserBalance(referrerId, LEVEL1_BONUS);
    
    // Record the referral
    const referralsCollection = collection(db, 'referrals');
    await addDoc(referralsCollection, {
      referrerId: referrerId,
      referredId: userId,
      level: 1,
      referralCode: referralCode,
      bonusAmount: LEVEL1_BONUS,
      timestamp: serverTimestamp()
    });
    
    // Process up to 5 levels of referrals
    let currentReferrerId = referrerId;
    let currentLevel = 2;
    
    while (currentLevel <= 5) {
      // Try to get the referrer of the current referrer
      const currentReferrerRef = doc(db, 'users', currentReferrerId);
      const currentReferrerSnap = await getDoc(currentReferrerRef);
      
      if (!currentReferrerSnap.exists() || !currentReferrerSnap.data().referredBy) {
        // No more referrers in the chain
        break;
      }
      
      // Get higher level referrer
      const higherReferrerId = currentReferrerSnap.data().referredBy;
      
      // Check if the higher level referrer has premium status
      const isHigherReferrerPremium = await hasPremiumPlan(higherReferrerId);
      
      // Determine the bonus amount based on level and premium status
      let bonusAmount = 0;
      
      if (currentLevel === 2) {
        bonusAmount = isHigherReferrerPremium ? REFERRAL_REWARD_COINS_LEVEL2_PREMIUM : REFERRAL_REWARD_COINS_LEVEL2;
      } else if (currentLevel === 3) {
        bonusAmount = isHigherReferrerPremium ? REFERRAL_REWARD_COINS_LEVEL3_PREMIUM : REFERRAL_REWARD_COINS_LEVEL3;
      } else if (currentLevel === 4) {
        bonusAmount = isHigherReferrerPremium ? REFERRAL_REWARD_COINS_LEVEL4_PREMIUM : REFERRAL_REWARD_COINS_LEVEL4;
      } else if (currentLevel === 5) {
        bonusAmount = isHigherReferrerPremium ? REFERRAL_REWARD_COINS_LEVEL5_PREMIUM : REFERRAL_REWARD_COINS_LEVEL5;
      }
      
      // Award the bonus to the higher level referrer
      if (bonusAmount > 0) {
        await updateUserBalance(higherReferrerId, bonusAmount);
        
        // Record the referral at this level
        await addDoc(referralsCollection, {
          referrerId: higherReferrerId,
          referredId: userId,
          level: currentLevel,
          referralCode: currentReferrerSnap.data().appliedReferralCode,
          bonusAmount: bonusAmount,
          timestamp: serverTimestamp()
        });
      }
      
      // Move up one level
      currentReferrerId = higherReferrerId;
      currentLevel++;
    }
    
    return { 
      success: true, 
      message: `Referral code applied! ${referrerDoc.data().fullName || 'User'} has received a ${LEVEL1_BONUS} DMI bonus.` 
    };
  } catch (error) {
    console.error("Error applying referral code:", error);
    return { success: false, message: "An error occurred while applying the referral code." };
  }
};

export const getReferredUsers = async (userId: string): Promise<any[]> => {
  try {
    const referralsRef = collection(db, 'referrals');
    const q = query(
      referralsRef, 
      where("referrerId", "==", userId),
      where("level", "==", 1)
    );
    const querySnapshot = await getDocs(q);
    
    const referredUsers = [];
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const referredUserRef = await getDoc(docRef(db, 'users', data.referredId));
      
      if (referredUserRef.exists()) {
        const userData = referredUserRef.data();
        referredUsers.push({
          id: data.referredId,
          fullName: userData.fullName,
          email: userData.email,
          timestamp: data.timestamp
        });
      }
    }
    
    return referredUsers;
  } catch (error) {
    console.error("Error getting referred users:", error);
    return [];
  }
};

export const getReferralStats = async (userId: string): Promise<any> => {
  try {
    // Get Level 1 referrals
    const l1ReferralsRef = collection(db, 'referrals');
    const l1Query = query(
      l1ReferralsRef, 
      where("referrerId", "==", userId),
      where("level", "==", 1)
    );
    const l1QuerySnapshot = await getDocs(l1Query);
    const level1Count = l1QuerySnapshot.size;
    
    // Get Level 2 referrals
    const l2ReferralsRef = collection(db, 'referrals');
    const l2Query = query(
      l2ReferralsRef, 
      where("referrerId", "==", userId),
      where("level", "==", 2)
    );
    const l2QuerySnapshot = await getDocs(l2Query);
    const level2Count = l2QuerySnapshot.size;
    
    // Calculate total earnings from referrals
    let totalEarnings = 0;
    
    // Add Level 1 earnings
    l1QuerySnapshot.forEach(doc => {
      const data = doc.data();
      totalEarnings += data.bonusAmount || 0;
    });
    
    // Add Level 2 earnings
    l2QuerySnapshot.forEach(doc => {
      const data = doc.data();
      totalEarnings += data.bonusAmount || 0;
    });
    
    return {
      totalReferrals: level1Count + level2Count,
      level1Count,
      level2Count,
      totalEarnings
    };
  } catch (error) {
    console.error("Error getting referral stats:", error);
    return {
      totalReferrals: 0,
      level1Count: 0,
      level2Count: 0,
      totalEarnings: 0
    };
  }
};

export const getReferralNetwork = async (userId: string): Promise<any[]> => {
  try {
    const network = [];
    
    // Get Level 1 referrals
    const l1ReferralsRef = collection(db, 'referrals');
    const l1Query = query(
      l1ReferralsRef, 
      where("referrerId", "==", userId),
      where("level", "==", 1)
    );
    const l1QuerySnapshot = await getDocs(l1Query);
    
    // Add Level 1 users to network
    for (const doc of l1QuerySnapshot.docs) {
      const data = doc.data();
      const referredUserRef = await getDoc(docRef(db, 'users', data.referredId));
      
      if (referredUserRef.exists()) {
        const userData = referredUserRef.data();
        network.push({
          id: data.referredId,
          name: userData.fullName,
          level: 1,
          parentId: userId
        });
        
        // Get Level 2 referrals (users referred by this level 1 user)
        const l2ReferralsRef = collection(db, 'referrals');
        const l2Query = query(
          l2ReferralsRef, 
          where("referrerId", "==", data.referredId),
          where("level", "==", 1)
        );
        const l2QuerySnapshot = await getDocs(l2Query);
        
        // Add Level 2 users to network
        for (const l2Doc of l2QuerySnapshot.docs) {
          const l2Data = l2Doc.data();
          const l2UserRef = await getDoc(docRef(db, 'users', l2Data.referredId));
          
          if (l2UserRef.exists()) {
            const l2UserData = l2UserRef.data();
            network.push({
              id: l2Data.referredId,
              name: l2UserData.fullName,
              level: 2,
              parentId: data.referredId
            });
          }
        }
      }
    }
    
    return network;
  } catch (error) {
    console.error("Error getting referral network:", error);
    return [];
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
      
      console.log(`[Firestore] Mining completed for user ${userId}. Earned coins: ${earnedCoins}`);
      
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
      
      // Update user balance - Adding to existing balance using increment operation
      console.log(`[Firestore] Adding ${earnedCoins} DMI coins to user ${userId} balance`);
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

// Get app settings from Firestore
export const getAppSettings = async () => {
  try {
    const appSettingsDoc = await getDoc(doc(db, 'settings', 'appSettings'));
    
    if (appSettingsDoc.exists()) {
      return appSettingsDoc.data() as { version: string; updateUrl: string };
    } else {
      // Create default settings if they don't exist
      const defaultSettings = {
        version: '1.0.0',
        updateUrl: 'https://dminetwork.us'
      };
      
      await setDoc(doc(db, 'settings', 'appSettings'), defaultSettings);
      return defaultSettings;
    }
  } catch (error) {
    console.error("Error getting app settings:", error);
    // Return default values if there's an error
    return { 
      version: '1.0.0', 
      updateUrl: 'https://dminetwork.us' 
    };
  }
};

// Update app settings (admin only)
export const updateAppSettings = async (version: string, updateUrl: string) => {
  try {
    await setDoc(
      doc(db, 'settings', 'appSettings'), 
      { version, updateUrl },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error("Error updating app settings:", error);
    return false;
  }
};

// App file management functions
export const updateAppFile = async (fileName: string, fileType: string, fileBase64: string): Promise<boolean> => {
  try {
    const appFileRef = doc(db, 'settings', 'appFile');
    
    await setDoc(appFileRef, {
      fileName,
      fileType,
      fileBase64,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating app file:", error);
    return false;
  }
};

export const getAppFileInfo = async (): Promise<{fileName: string, fileType: string, updatedAt: any} | null> => {
  try {
    const appFileRef = doc(db, 'settings', 'appFile');
    const appFileDoc = await getDoc(appFileRef);
    
    if (appFileDoc.exists()) {
      const data = appFileDoc.data();
      return {
        fileName: data.fileName,
        fileType: data.fileType,
        updatedAt: data.updatedAt
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error getting app file info:", error);
    return null;
  }
};
