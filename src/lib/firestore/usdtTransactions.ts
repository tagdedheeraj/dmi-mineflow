
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  db
} from "./core";

// USDT Transaction types
export type UsdtTransactionType = 'deposit' | 'withdrawal' | 'refund' | 'bonus' | 'commission';

// USDT Transaction operations
export const addUsdtTransaction = async (
  userId: string,
  amount: number,
  type: UsdtTransactionType,
  description: string,
  timestamp: number
): Promise<void> => {
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
  }
};

// Get user's USDT transactions
export const getUserUsdtTransactions = async (userId: string, transactionType?: UsdtTransactionType, limit_count = 50) => {
  try {
    const transactionsCollection = collection(db, 'usdt_transactions');
    
    let q;
    if (transactionType) {
      q = query(
        transactionsCollection, 
        where("userId", "==", userId),
        where("type", "==", transactionType)
      );
    } else {
      q = query(
        transactionsCollection, 
        where("userId", "==", userId)
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    // Sort by timestamp manually, since we're not using orderBy
    const transactions = querySnapshot.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data()
      };
    });
    
    // Sort by timestamp in descending order
    transactions.sort((a, b) => b.timestamp - a.timestamp);
    
    // Limit results
    return transactions.slice(0, limit_count);
  } catch (error) {
    console.error("Error getting USDT transactions:", error);
    return [];
  }
};

// Get user's total USDT transaction amounts by type
export const getUserUsdtTransactionsTotalByType = async (userId: string, type: UsdtTransactionType) => {
  try {
    const transactionsCollection = collection(db, 'usdt_transactions');
    const q = query(
      transactionsCollection, 
      where("userId", "==", userId),
      where("type", "==", type)
    );
    
    const querySnapshot = await getDocs(q);
    let total = 0;
    
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      total += data.amount;
    });
    
    return total;
  } catch (error) {
    console.error(`Error getting USDT ${type} total:`, error);
    return 0;
  }
};
