
import { collection, doc, getDocs, query, where, updateDoc, getDoc, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { KYC_STATUS, KYCDocument } from "./types";

// Admin KYC Management functions
export const getAllKYCRequests = async (statusFilter?: string): Promise<KYCDocument[]> => {
  try {
    console.log("[Firestore] Getting all KYC requests with filter:", statusFilter);
    const kycCollection = collection(db, 'kyc_verifications');
    
    let q;
    if (statusFilter && statusFilter !== 'all') {
      q = query(
        kycCollection,
        where("status", "==", statusFilter),
        orderBy("submittedAt", "desc")
      );
    } else {
      q = query(
        kycCollection,
        orderBy("submittedAt", "desc")
      );
    }
    
    const querySnapshot = await getDocs(q);
    const requests: KYCDocument[] = [];
    
    querySnapshot.forEach(doc => {
      const data = doc.data() as Omit<KYCDocument, 'id'>;
      requests.push({
        ...data,
        id: doc.id,
      });
    });
    
    console.log("[Firestore] Found KYC requests:", requests.length);
    return requests;
  } catch (error) {
    console.error("[Firestore] Error getting KYC requests:", error);
    return [];
  }
};

export const getKYCRequestById = async (kycId: string): Promise<KYCDocument | null> => {
  try {
    console.log("[Firestore] Getting KYC request by ID:", kycId);
    const kycRef = doc(db, 'kyc_verifications', kycId);
    const docSnap = await getDoc(kycRef);
    
    if (!docSnap.exists()) {
      console.log("[Firestore] KYC request not found");
      return null;
    }
    
    const data = docSnap.data() as Omit<KYCDocument, 'id'>;
    return {
      ...data,
      id: docSnap.id,
    };
  } catch (error) {
    console.error("[Firestore] Error getting KYC request by ID:", error);
    return null;
  }
};

export const approveKYCRequest = async (kycId: string, adminId: string): Promise<boolean> => {
  try {
    console.log("[Firestore] Approving KYC request:", kycId);
    const kycRef = doc(db, 'kyc_verifications', kycId);
    
    await updateDoc(kycRef, {
      status: KYC_STATUS.APPROVED,
      reviewedAt: serverTimestamp(),
      reviewedBy: adminId,
    });
    
    console.log("[Firestore] KYC request approved successfully");
    return true;
  } catch (error) {
    console.error("[Firestore] Error approving KYC request:", error);
    return false;
  }
};

export const rejectKYCRequest = async (kycId: string, adminId: string, reason: string): Promise<boolean> => {
  try {
    console.log("[Firestore] Rejecting KYC request:", kycId);
    const kycRef = doc(db, 'kyc_verifications', kycId);
    
    await updateDoc(kycRef, {
      status: KYC_STATUS.REJECTED,
      rejectionReason: reason,
      reviewedAt: serverTimestamp(),
      reviewedBy: adminId,
    });
    
    console.log("[Firestore] KYC request rejected successfully");
    return true;
  } catch (error) {
    console.error("[Firestore] Error rejecting KYC request:", error);
    return false;
  }
};

export const resetKYCRequest = async (kycId: string): Promise<boolean> => {
  try {
    console.log("[Firestore] Resetting KYC request:", kycId);
    const kycRef = doc(db, 'kyc_verifications', kycId);
    
    // Delete the document to allow the user to submit a fresh KYC
    // Another approach would be to flag it as 'reset' and allow resubmission
    await updateDoc(kycRef, {
      status: 'reset',
      resetAt: serverTimestamp(),
    });
    
    console.log("[Firestore] KYC request reset successfully");
    return true;
  } catch (error) {
    console.error("[Firestore] Error resetting KYC request:", error);
    return false;
  }
};
