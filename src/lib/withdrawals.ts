
import { 
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  orderBy,
  getDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { WithdrawalRequest } from "./withdrawalTypes";
import { User } from "./storage";
import { updateUserBalance, updateUsdtEarnings } from "./firestore";

// Collection reference
export const withdrawalRequestsCollection = collection(db, 'withdrawal_requests');

// Create a new withdrawal request
export const createWithdrawalRequest = async (
  userId: string,
  userName: string,
  userEmail: string,
  amount: number,
  usdtAddress: string
): Promise<string | null> => {
  try {
    const withdrawalRequest: WithdrawalRequest = {
      userId,
      userName,
      userEmail,
      amount,
      usdtAddress,
      status: 'pending',
      createdAt: Date.now(),
    };

    const docRef = await addDoc(withdrawalRequestsCollection, withdrawalRequest);
    
    // Deduct the amount from user's USDT earnings when request is created
    await updateUsdtEarnings(userId, -amount);
    
    return docRef.id;
  } catch (error) {
    console.error("Error creating withdrawal request:", error);
    return null;
  }
};

// Get all withdrawal requests
export const getAllWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
  try {
    const q = query(
      withdrawalRequestsCollection,
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as WithdrawalRequest;
      return { ...data, id: doc.id };
    });
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error);
    return [];
  }
};

// Get pending withdrawal requests
export const getPendingWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
  try {
    const q = query(
      withdrawalRequestsCollection,
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as WithdrawalRequest;
      return { ...data, id: doc.id };
    });
  } catch (error) {
    console.error("Error fetching pending withdrawal requests:", error);
    return [];
  }
};

// Get user's withdrawal requests
export const getUserWithdrawalRequests = async (userId: string): Promise<WithdrawalRequest[]> => {
  try {
    const q = query(
      withdrawalRequestsCollection,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as WithdrawalRequest;
      return { ...data, id: doc.id };
    });
  } catch (error) {
    console.error("Error fetching user withdrawal requests:", error);
    return [];
  }
};

// Approve a withdrawal request
export const approveWithdrawalRequest = async (
  requestId: string,
  adminId: string
): Promise<boolean> => {
  try {
    const requestRef = doc(db, 'withdrawal_requests', requestId);
    const requestSnap = await getDoc(requestRef);
    
    if (!requestSnap.exists()) {
      return false;
    }
    
    // Update the request status
    await updateDoc(requestRef, {
      status: 'approved',
      processedAt: Date.now(),
      processedBy: adminId
    });
    
    return true;
  } catch (error) {
    console.error("Error approving withdrawal request:", error);
    return false;
  }
};

// Reject a withdrawal request
export const rejectWithdrawalRequest = async (
  requestId: string,
  adminId: string,
  rejectionReason: string
): Promise<boolean> => {
  try {
    const requestRef = doc(db, 'withdrawal_requests', requestId);
    const requestSnap = await getDoc(requestRef);
    
    if (!requestSnap.exists()) {
      return false;
    }
    
    const request = requestSnap.data() as WithdrawalRequest;
    
    // Return the USDT to the user's account if rejected
    await updateUsdtEarnings(request.userId, request.amount);
    
    // Update the request status
    await updateDoc(requestRef, {
      status: 'rejected',
      processedAt: Date.now(),
      processedBy: adminId,
      rejectionReason: rejectionReason
    });
    
    return true;
  } catch (error) {
    console.error("Error rejecting withdrawal request:", error);
    return false;
  }
};
