
import { 
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { WithdrawalRequest } from "./types";
import { withdrawalRequestsCollection } from "./createRequest";

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
