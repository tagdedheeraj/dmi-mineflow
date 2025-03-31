
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
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { WithdrawalRequest } from "./withdrawalTypes";
import { User } from "./storage";
import { updateUserBalance, updateUsdtEarnings, getUser, addUsdtTransaction } from "./firestore";

// Collection reference
export const withdrawalRequestsCollection = collection(db, 'withdrawal_requests');

// Platform fee percentage
export const PLATFORM_FEE_PERCENTAGE = 5;

// Create a new withdrawal request
export const createWithdrawalRequest = async (
  userId: string,
  userName: string,
  userEmail: string,
  amount: number,
  usdtAddress: string
): Promise<string | null> => {
  try {
    // Calculate platform fee
    const platformFee = (amount * PLATFORM_FEE_PERCENTAGE) / 100;
    const netAmount = amount - platformFee;
    
    const withdrawalRequest: WithdrawalRequest = {
      userId,
      userName,
      userEmail,
      amount,                // Total withdrawal amount
      netAmount,             // Amount after platform fee
      platformFee,           // Platform fee amount
      platformFeePercentage: PLATFORM_FEE_PERCENTAGE,  // Fee percentage applied
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
    // Simple query without compound conditions to avoid index requirements
    const q = query(withdrawalRequestsCollection);
    
    const querySnapshot = await getDocs(q);
    const requests = querySnapshot.docs
      .map(doc => {
        const data = doc.data() as WithdrawalRequest;
        return { ...data, id: doc.id };
      })
      // Sort in memory instead of using orderBy to avoid Firestore index requirements
      .sort((a, b) => b.createdAt - a.createdAt);
    
    return requests;
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error);
    return [];
  }
};

// Get pending withdrawal requests
export const getPendingWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
  try {
    // Using only where clause without orderBy to avoid index requirements
    const q = query(
      withdrawalRequestsCollection,
      where("status", "==", "pending")
    );
    
    const querySnapshot = await getDocs(q);
    const pendingRequests = querySnapshot.docs
      .map(doc => {
        const data = doc.data() as WithdrawalRequest;
        return { ...data, id: doc.id };
      })
      // Sort in memory instead of using orderBy to avoid Firestore index requirements
      .sort((a, b) => b.createdAt - a.createdAt);
    
    return pendingRequests;
  } catch (error) {
    console.error("Error fetching pending withdrawal requests:", error);
    return [];
  }
};

// Get user's withdrawal requests
export const getUserWithdrawalRequests = async (userId: string): Promise<WithdrawalRequest[]> => {
  try {
    // Using only where clause without orderBy to avoid index requirements
    const q = query(
      withdrawalRequestsCollection,
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
    const userRequests = querySnapshot.docs
      .map(doc => {
        const data = doc.data() as WithdrawalRequest;
        return { ...data, id: doc.id };
      })
      // Sort in memory instead of using orderBy to avoid Firestore index requirements
      .sort((a, b) => b.createdAt - a.createdAt);
    
    return userRequests;
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
    console.log(`Starting approval process for request ${requestId} by admin ${adminId}`);
    const requestRef = doc(db, 'withdrawal_requests', requestId);
    const requestSnap = await getDoc(requestRef);
    
    if (!requestSnap.exists()) {
      console.error(`Withdrawal request with ID ${requestId} does not exist`);
      return false;
    }
    
    const request = requestSnap.data() as WithdrawalRequest;
    console.log(`Found request data:`, request);
    
    // Add a USDT transaction record for the withdrawal
    await addUsdtTransaction(
      request.userId,
      -request.amount,
      'withdrawal',
      `Withdrawal approved (${request.usdtAddress})`,
      Date.now()
    );
    console.log(`Added transaction record for user ${request.userId}`);
    
    // Update the request status
    await updateDoc(requestRef, {
      status: 'approved',
      processedAt: Date.now(),
      processedBy: adminId
    });
    
    console.log(`Withdrawal request ${requestId} approved successfully`);
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
    console.log(`Starting rejection process for request ${requestId} by admin ${adminId}`);
    console.log(`Rejection reason: ${rejectionReason}`);
    
    const requestRef = doc(db, 'withdrawal_requests', requestId);
    const requestSnap = await getDoc(requestRef);
    
    if (!requestSnap.exists()) {
      console.error(`Withdrawal request with ID ${requestId} does not exist`);
      return false;
    }
    
    const request = requestSnap.data() as WithdrawalRequest;
    console.log(`Found request data:`, request);
    
    // Return the USDT to the user's account if rejected
    await updateUsdtEarnings(request.userId, request.amount);
    console.log(`Returned ${request.amount} USDT to user ${request.userId}`);
    
    // Add a transaction record for the returned amount
    await addUsdtTransaction(
      request.userId,
      request.amount,
      'refund',
      `Withdrawal rejected: ${rejectionReason}`,
      Date.now()
    );
    console.log(`Added refund transaction record`);
    
    // Update the request status
    await updateDoc(requestRef, {
      status: 'rejected',
      processedAt: Date.now(),
      processedBy: adminId,
      rejectionReason: rejectionReason
    });
    
    console.log(`Withdrawal request ${requestId} rejected successfully`);
    return true;
  } catch (error) {
    console.error("Error rejecting withdrawal request:", error);
    return false;
  }
};
