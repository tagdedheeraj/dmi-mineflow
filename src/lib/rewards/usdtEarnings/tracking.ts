
import { 
  db, 
  addUsdtTransaction
} from '../../firebase';
import { 
  doc, 
  getDoc, 
  updateDoc,
  increment
} from 'firebase/firestore';
import { User } from '../../storage';
import { getTodayDateKey } from '../dateUtils';
import { getUser } from '../rewardsTracking';
import { notifyUsdtEarnings } from '../notificationService';

// Function to get the last USDT earnings update date (in IST)
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

// Function to update the last USDT earnings update date (using IST date)
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

// Function to update USDT earnings with improved logging and transaction recording
export const updateUsdtEarnings = async (userId: string, amount: number, planId?: string): Promise<User | null> => {
  try {
    console.log(`Updating USDT earnings for user ${userId}: +${amount} USDT${planId ? ` from plan ${planId}` : ''}`);
    
    const userRef = doc(db, 'users', userId);
    const userBefore = await getDoc(userRef);
    
    if (!userBefore.exists()) {
      console.error(`User ${userId} does not exist, cannot update USDT earnings`);
      return null;
    }
    
    const currentUsdtEarnings = userBefore.data().usdtEarnings || 0;
    console.log(`Current USDT earnings: ${currentUsdtEarnings}, Adding: ${amount}`);
    
    // Use increment to add the amount to existing USDT earnings
    await updateDoc(userRef, {
      usdtEarnings: increment(amount)
    });
    
    // Log the transaction with more specific details
    await addUsdtTransaction(
      userId,
      amount,
      'deposit',
      planId ? `Earnings from plan ${planId}` : 'Daily plan earnings',
      Date.now()
    );
    
    // Send notification to user about USDT earnings
    await notifyUsdtEarnings(
      userId, 
      amount, 
      planId ? `plan ${planId}` : 'daily earnings'
    );
    
    console.log(`Successfully added ${amount} USDT to user ${userId}'s earnings from plan`);
    
    // Fetch and return the updated user
    const updatedUser = await getUser(userId);
    console.log(`Updated user USDT earnings: ${updatedUser?.usdtEarnings}`);
    
    return updatedUser;
  } catch (error) {
    console.error("Error updating USDT earnings:", error);
    return null;
  }
};
