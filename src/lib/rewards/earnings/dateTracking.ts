
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

/**
 * Function to get the last USDT earnings update date (in IST)
 */
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

/**
 * Function to update the last USDT earnings update date (using IST date)
 */
export const updateLastUsdtUpdateDate = async (userId: string, date: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastUsdtEarningsUpdate: date
    });
    console.log(`Updated lastUsdtEarningsUpdate for user ${userId} to ${date} (IST)`);
  } catch (error) {
    console.error("Error updating last USDT update date:", error);
  }
};
