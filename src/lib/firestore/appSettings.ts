
import {
  doc,
  getDoc,
  setDoc,
  db
} from "./core";

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
