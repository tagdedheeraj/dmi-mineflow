
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
  limit,
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
        where("type", "==", transactionType),
        orderBy("timestamp", "desc"),
        limit(limit_count)
      );
    } else {
      q = query(
        transactionsCollection, 
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
        limit(limit_count)
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp,
      };
    });
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
