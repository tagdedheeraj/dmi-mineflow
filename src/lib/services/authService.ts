import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { User, DeviceRegistration } from '../storage';
import { db, deviceRegistrationsCollection } from "../firebase";

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
      await setDoc(doc(db, 'device_registrations', `device_${Date.now()}`), {
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
