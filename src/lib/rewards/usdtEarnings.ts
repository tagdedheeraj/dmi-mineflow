
import { 
  db, 
  addUsdtTransaction
} from '../firebase';
import { 
  doc, 
  getDoc, 
  updateDoc,
  increment
} from 'firebase/firestore';
import { User } from '../storage';
import { getTodayDateKey } from './dateUtils';
import { getUser } from './rewardsTracking';

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
export const updateUsdtEarnings = async (userId: string, amount: number): Promise<User | null> => {
  try {
    console.log(`Updating USDT earnings for user ${userId}: +${amount} USDT`);
    
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
      'Daily plan earnings',
      Date.now()
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

// Enhanced function to process daily USDT earnings with better error handling
export const processDailyUsdtEarnings = async (
  userId: string, 
  activePlans: Array<any>, 
  plansData: Array<any>
): Promise<{
  success: boolean;
  totalAmount: number;
  details: {planName: string; amount: number}[];
}> => {
  try {
    // Get today's date in IST (YYYY-MM-DD)
    const todayIST = getTodayDateKey();
    const lastUpdateDate = await getLastUsdtUpdateDate(userId);
    
    console.log(`Processing daily USDT earnings for user ${userId} (IST time)`);
    console.log(`Today (IST): ${todayIST}, Last update: ${lastUpdateDate}`);
    
    // If already updated today (IST), return without processing
    if (lastUpdateDate === todayIST) {
      console.log(`Already processed earnings for today (${todayIST} IST), skipping.`);
      return {
        success: true,
        totalAmount: 0,
        details: []
      };
    }
    
    let totalDailyEarnings = 0;
    const earningDetails: {planName: string; amount: number}[] = [];
    
    // Process active plans that haven't expired
    for (const plan of activePlans) {
      // Skip expired plans
      if (new Date() >= new Date(plan.expiresAt)) {
        console.log(`Plan ${plan.id} has expired, skipping.`);
        continue;
      }
      
      const planInfo = plansData.find((p: any) => p.id === plan.id);
      if (planInfo) {
        console.log(`Processing earnings for plan: ${planInfo.name}, dailyEarnings: ${planInfo.dailyEarnings}`);
        totalDailyEarnings += planInfo.dailyEarnings;
        earningDetails.push({
          planName: planInfo.name,
          amount: planInfo.dailyEarnings
        });
      } else {
        console.log(`Could not find plan info for id: ${plan.id}`);
      }
    }
    
    if (totalDailyEarnings > 0) {
      console.log(`Adding total of ${totalDailyEarnings} USDT to user ${userId}'s earnings (IST time update)`);
      
      // Update user's USDT earnings
      const updatedUser = await updateUsdtEarnings(userId, totalDailyEarnings);
      
      if (updatedUser) {
        // Update the last update date to today's IST date
        await updateLastUsdtUpdateDate(userId, todayIST);
        console.log(`Updated last USDT earnings date to ${todayIST} (IST)`);
        
        return {
          success: true,
          totalAmount: totalDailyEarnings,
          details: earningDetails
        };
      } else {
        throw new Error("Failed to update user's USDT earnings");
      }
    } else {
      // Even if there are no earnings, update the date to avoid checking again today
      console.log(`No earnings to add, updating last update date to ${todayIST} (IST)`);
      await updateLastUsdtUpdateDate(userId, todayIST);
    }
    
    return {
      success: totalDailyEarnings > 0,
      totalAmount: totalDailyEarnings,
      details: earningDetails
    };
  } catch (error) {
    console.error("Error processing daily USDT earnings:", error);
    return {
      success: false,
      totalAmount: 0,
      details: []
    };
  }
};
