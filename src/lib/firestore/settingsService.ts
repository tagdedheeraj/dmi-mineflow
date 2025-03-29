import { 
  doc, 
  getDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";

// Get app settings
export const getAppSettings = async () => {
  try {
    const appSettingsRef = doc(db, 'app_settings', 'current');
    const appSettingsDoc = await getDoc(appSettingsRef);
    
    if (appSettingsDoc.exists()) {
      const data = appSettingsDoc.data();
      return {
        version: data.version || '1.0.0',
        updateUrl: data.updateUrl || 'https://dminetwork.us',
        showLovableBadge: data.showLovableBadge !== undefined ? data.showLovableBadge : false
      };
    } else {
      // If no settings exist, return defaults
      return {
        version: '1.0.0',
        updateUrl: 'https://dminetwork.us',
        showLovableBadge: false
      };
    }
  } catch (error) {
    console.error("Error getting app settings:", error);
    return null;
  }
};

// Update app settings
export const updateAppSettings = async (version: string, updateUrl: string, showLovableBadge: boolean = false) => {
  try {
    const appSettingsRef = doc(db, 'app_settings', 'current');
    await setDoc(appSettingsRef, {
      version,
      updateUrl,
      showLovableBadge,
      updatedAt: serverTimestamp()
    });
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

// Get DMI coin value 
export const getDmiCoinValue = async (): Promise<number> => {
  try {
    const coinValueRef = doc(db, 'settings', 'dmiCoinValue');
    const coinValueDoc = await getDoc(coinValueRef);
    
    if (coinValueDoc.exists()) {
      return coinValueDoc.data().value || 0.1732; // Default to the hardcoded value if no value field
    } else {
      // If no document exists, create it with the default value
      await setDoc(coinValueRef, {
        value: 0.1732,
        updatedAt: serverTimestamp()
      });
      return 0.1732;
    }
  } catch (error) {
    console.error("Error getting DMI coin value:", error);
    return 0.1732; // Default fallback value
  }
};

// Update DMI coin value
export const updateDmiCoinValue = async (value: number): Promise<boolean> => {
  try {
    if (value <= 0) {
      throw new Error("DMI coin value must be greater than 0");
    }
    
    const coinValueRef = doc(db, 'settings', 'dmiCoinValue');
    await setDoc(coinValueRef, {
      value,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating DMI coin value:", error);
    return false;
  }
};
