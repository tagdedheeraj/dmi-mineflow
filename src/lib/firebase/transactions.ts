
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

// Helper function for USDT transactions
export const addUsdtTransaction = async (
  userId: string,
  amount: number,
  type: 'deposit' | 'withdrawal' | 'refund' | 'bonus',
  description: string,
  timestamp: number
) => {
  try {
    const transactionsCollection = collection(db, 'usdt_transactions');
    await addDoc(transactionsCollection, {
      userId,
      amount,
      type,
      description,
      timestamp,
      createdAt: serverTimestamp()
    });
    
    console.log(`USDT transaction recorded for user ${userId}: ${type} ${amount}`);
  } catch (error) {
    console.error("Error adding USDT transaction:", error);
    throw error;
  }
};

// Get user's USDT transactions
export const getUserTransactions = async (userId: string) => {
  try {
    const transactionsCollection = collection(db, 'usdt_transactions');
    const q = query(
      transactionsCollection,
      where("userId", "==", userId),
      // Order by timestamp descending (newest first)
      // @ts-ignore - Temporary to avoid TS errors
      where("timestamp", "!=", null)
    );
    
    const querySnapshot = await getDocs(q);
    const transactions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by timestamp descending
    return transactions.sort((a: any, b: any) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Error getting user transactions:", error);
    return [];
  }
};
