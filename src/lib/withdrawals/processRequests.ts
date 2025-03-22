
import { 
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { WithdrawalRequest } from "./types";
import { updateUsdtEarnings } from "../rewards/earningsUpdater";
import { addUsdtTransaction } from "../firestore";
import { notifyWithdrawalRejected } from "../rewards/notificationService";

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
    
    const request = requestSnap.data() as WithdrawalRequest;
    
    // Add a USDT transaction record for the withdrawal
    await addUsdtTransaction(
      request.userId,
      -request.amount,
      'withdrawal',
      `Withdrawal approved (${request.usdtAddress})`,
      Date.now()
    );
    
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
    console.log(`Starting rejection process for request ${requestId}`);
    const requestRef = doc(db, 'withdrawal_requests', requestId);
    const requestSnap = await getDoc(requestRef);
    
    if (!requestSnap.exists()) {
      console.error(`Request ${requestId} does not exist`);
      return false;
    }
    
    const request = requestSnap.data() as WithdrawalRequest;
    console.log(`Request data:`, request);
    
    // Return the USDT to the user's account if rejected
    console.log(`Returning ${request.amount} USDT to user ${request.userId}`);
    await updateUsdtEarnings(request.userId, request.amount);
    
    // Add a transaction record for the returned amount
    console.log(`Adding transaction record for returned amount`);
    await addUsdtTransaction(
      request.userId,
      request.amount,
      'refund',
      `Withdrawal rejected: ${rejectionReason}`,
      Date.now()
    );
    
    // Update the request status
    console.log(`Updating request status to rejected`);
    await updateDoc(requestRef, {
      status: 'rejected',
      processedAt: Date.now(),
      processedBy: adminId,
      rejectionReason: rejectionReason
    });
    
    // Send notification to the user
    try {
      await notifyWithdrawalRejected(
        request.userId,
        request.amount,
        'USDT',
        rejectionReason
      );
    } catch (notifyError) {
      console.error("Error sending rejection notification:", notifyError);
      // Continue with the process even if notification fails
    }
    
    console.log(`Withdrawal request ${requestId} rejected successfully`);
    return true;
  } catch (error) {
    console.error("Error rejecting withdrawal request:", error);
    return false;
  }
};
