
import { 
  collection,
  addDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { WithdrawalRequest, PLATFORM_FEE_PERCENTAGE } from "./types";
import { updateUsdtEarnings } from "../rewards/earningsUpdater";

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
