import { 
  collection, 
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { getUser, updateUserBalance, findUserByEmail } from "./userService";

export interface StakingTransaction {
  id?: string;
  userId: string;
  amount: number;
  txId: string;
  dailyRate: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: any;
}

// Save a new staking transaction
export const saveStakingTransaction = async (
  userId: string,
  amount: number,
  txId: string
): Promise<string | null> => {
  try {
    console.log(`[Firestore] Saving staking transaction for user ${userId}, amount: ${amount}`);
    
    const stakingCollection = collection(db, 'staking_transactions');
    const dailyRate = amount * 0.01; // 1% daily rate
    
    const stakingData = {
      userId,
      amount,
      txId,
      dailyRate,
      status: 'active',
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(stakingCollection, stakingData);
    console.log(`[Firestore] Staking transaction saved with ID: ${docRef.id}`);
    
    // Get current user data to update staking totals
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentStakingData = userData.stakingData || { totalStaked: 0, totalEarned: 0 };
      
      // Update the user's staking data in their profile
      const totalStaked = (currentStakingData.totalStaked || 0) + amount;
      const totalEarned = currentStakingData.totalEarned || 0;
      
      await updateDoc(userRef, {
        stakingData: {
          totalStaked,
          totalEarned
        }
      });
      
      console.log(`[Firestore] Updated user staking data: totalStaked=${totalStaked}, totalEarned=${totalEarned}`);
    } else {
      console.error(`[Firestore] User document not found for ID: ${userId}`);
    }
    
    return docRef.id;
  } catch (error) {
    console.error("Error saving staking transaction:", error);
    return null;
  }
};

// Add daily earnings to the user's staking data
export const addStakingEarnings = async (
  userId: string,
  earningsAmount: number
): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentStakingData = userData.stakingData || { totalStaked: 0, totalEarned: 0 };
      
      const totalStaked = currentStakingData.totalStaked || 0;
      const totalEarned = (currentStakingData.totalEarned || 0) + earningsAmount;
      
      await updateDoc(userRef, {
        stakingData: {
          totalStaked,
          totalEarned
        }
      });
      
      console.log(`[Firestore] Added staking earnings: ${earningsAmount} to user ${userId}`);
      return true;
    }
    
    console.error(`[Firestore] User document not found for ID: ${userId}`);
    return false;
  } catch (error) {
    console.error("Error adding staking earnings:", error);
    return false;
  }
};

// Get user's staking history
export const getStakingHistory = async (userId: string): Promise<StakingTransaction[]> => {
  try {
    console.log(`[Firestore] Getting staking history for user ${userId}`);
    const stakingCollection = collection(db, 'staking_transactions');
    const q = query(
      stakingCollection,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const history: StakingTransaction[] = [];
    
    querySnapshot.forEach(doc => {
      const data = doc.data();
      history.push({
        id: doc.id,
        userId: data.userId,
        amount: data.amount,
        txId: data.txId,
        dailyRate: data.dailyRate,
        status: data.status,
        createdAt: data.createdAt
      });
    });
    
    console.log(`[Firestore] Retrieved ${history.length} staking transactions for user ${userId}`);
    return history;
  } catch (error) {
    console.error("Error getting staking history:", error);
    return [];
  }
};

// Create a new function to save manual staking transaction by admin
export const saveAdminStakingTransaction = async (
  userEmail: string,
  amount: number,
  txId: string
): Promise<{success: boolean, message: string, userId?: string}> => {
  try {
    console.log(`[Firestore] Admin creating staking transaction for user email: ${userEmail}, amount: ${amount}`);
    
    // Find user by email
    const user = await findUserByEmail(userEmail);
    
    if (!user) {
      return {
        success: false,
        message: `No user found with email: ${userEmail}`
      };
    }
    
    const userId = user.id;
    
    // Save the staking transaction using the existing function
    const stakingId = await saveStakingTransaction(userId, amount, txId);
    
    if (stakingId) {
      return {
        success: true,
        message: `Successfully created staking transaction for user: ${user.fullName || userEmail}`,
        userId
      };
    } else {
      return {
        success: false,
        message: "Failed to save staking transaction"
      };
    }
  } catch (error) {
    console.error("Error creating admin staking transaction:", error);
    return {
      success: false,
      message: `Error: ${error.message || "Unknown error occurred"}`
    };
  }
};
