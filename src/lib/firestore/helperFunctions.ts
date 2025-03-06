
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

// Helper function for tracking updates
export const trackDBUpdate = async (
  userId: string, 
  updateType: string, 
  updateData: any
): Promise<void> => {
  try {
    const updatesRef = doc(db, 'updates_log', `${userId}_${updateType}_${Date.now()}`);
    await setDoc(updatesRef, {
      userId,
      type: updateType,
      data: updateData,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error(`Error tracking ${updateType} update:`, error);
  }
};
