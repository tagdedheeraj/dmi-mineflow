
import { 
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

// KYC Settings Management
export const updateKYCSettings = async (isEnabled: boolean): Promise<boolean> => {
  try {
    console.log("[Firestore] Updating KYC settings, enabled:", isEnabled);
    const settingsRef = doc(db, 'app_settings', 'kyc');
    
    await setDoc(settingsRef, {
      isEnabled,
      updatedAt: serverTimestamp(),
    });
    
    console.log("[Firestore] KYC settings updated successfully");
    return true;
  } catch (error) {
    console.error("[Firestore] Error updating KYC settings:", error);
    return false;
  }
};

export const getKYCSettings = async (): Promise<{isEnabled: boolean}> => {
  try {
    console.log("[Firestore] Getting KYC settings");
    const settingsRef = doc(db, 'app_settings', 'kyc');
    const docSnap = await getDoc(settingsRef);
    
    if (!docSnap.exists()) {
      console.log("[Firestore] KYC settings not found, creating default");
      await setDoc(settingsRef, {
        isEnabled: false,
        updatedAt: serverTimestamp(),
      });
      return { isEnabled: false };
    }
    
    const data = docSnap.data();
    return { isEnabled: data.isEnabled };
  } catch (error) {
    console.error("[Firestore] Error getting KYC settings:", error);
    return { isEnabled: false };
  }
};
