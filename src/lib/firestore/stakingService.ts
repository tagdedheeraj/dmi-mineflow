
import { 
  collection, 
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { getUser, updateUserBalance } from "./userService";

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
    
    // Update the user's staking data in their profile
    const user = await getUser(userId);
    if (user) {
      const userRef = doc(db, 'users', userId);
      const totalStaked = (user.stakingData?.totalStaked || 0) + amount;
      const totalEarned = user.stakingData?.totalEarned || 0;
      
      await updateDoc(userRef, {
        stakingData: {
          totalStaked,
          totalEarned
        }
      });
      
      console.log(`[Firestore] Updated user staking data: totalStaked=${totalStaked}, totalEarned=${totalEarned}`);
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
    const user = await getUser(userId);
    if (user) {
      const userRef = doc(db, 'users', userId);
      const totalStaked = user.stakingData?.totalStaked || 0;
      const totalEarned = (user.stakingData?.totalEarned || 0) + earningsAmount;
      
      await updateDoc(userRef, {
        stakingData: {
          totalStaked,
          totalEarned
        }
      });
      
      console.log(`[Firestore] Added staking earnings: ${earningsAmount} to user ${userId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error adding staking earnings:", error);
    return false;
  }
};

// Get user's staking history
export const getStakingHistory = async (userId: string): Promise<StakingTransaction[]> => {
  try {
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
