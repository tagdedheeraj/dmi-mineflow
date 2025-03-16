
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase";

// USDT Transaction operations
export const addUsdtTransaction = async (
  userId: string,
  amount: number,
  type: 'deposit' | 'withdrawal' | 'refund' | 'bonus',
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
