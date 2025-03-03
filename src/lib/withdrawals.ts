
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  collection,
  orderBy,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import type { User } from './storage';

// Withdrawal request type
export interface WithdrawalRequest {
  id?: string;
  userId: string;
  userName: string;
  amount: number;
  usdtAddress: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  processedAt?: number;
}

// Get all withdrawal requests for a user
export const getUserWithdrawalRequests = async (userId: string): Promise<WithdrawalRequest[]> => {
  try {
    const q = query(
      collection(db, 'withdrawal_requests'),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as WithdrawalRequest;
      data.id = doc.id;
      return data;
    });
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error);
    return [];
  }
};

// Create a new withdrawal request
export const createWithdrawalRequest = async (request: Omit<WithdrawalRequest, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, 'withdrawal_requests'), {
      ...request,
      createdAt: Date.now()
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error creating withdrawal request:", error);
    return null;
  }
};

// Update a withdrawal request status
export const updateWithdrawalRequestStatus = async (
  requestId: string, 
  status: 'approved' | 'rejected'
): Promise<boolean> => {
  try {
    const requestRef = doc(db, 'withdrawal_requests', requestId);
    await updateDoc(requestRef, {
      status,
      processedAt: Date.now()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating withdrawal request:", error);
    return false;
  }
};

// Get all pending withdrawal requests (for admin)
export const getPendingWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
  try {
    const q = query(
      collection(db, 'withdrawal_requests'),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as WithdrawalRequest;
      data.id = doc.id;
      return data;
    });
  } catch (error) {
    console.error("Error fetching pending withdrawal requests:", error);
    return [];
  }
};
