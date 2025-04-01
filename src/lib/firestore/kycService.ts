
import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  getDoc,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// Constants
export const KYC_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Types
export type KYCDocument = {
  id?: string;
  userId: string;
  fullName: string;
  idNumber: string;
  address: string;
  documentType: 'government_id' | 'passport';
  documentExpiryDate: string;
  frontImageUrl: string;
  backImageUrl: string;
  selfieImageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt: any;
  reviewedAt?: any;
  reviewedBy?: string;
};

// User-facing KYC functions
export const submitKYCRequest = async (kycData: Omit<KYCDocument, 'status' | 'submittedAt' | 'id'>): Promise<string> => {
  try {
    console.log("[Firestore] Submitting KYC request for user:", kycData.userId);
    
    // Check if user already has a KYC request
    const existingRequest = await getUserKYCStatus(kycData.userId);
    if (existingRequest) {
      console.log("[Firestore] User already has a KYC request:", existingRequest.status);
      if (existingRequest.status === KYC_STATUS.PENDING) {
        throw new Error("You already have a pending KYC verification request");
      } else if (existingRequest.status === KYC_STATUS.APPROVED) {
        throw new Error("You are already KYC verified");
      }
    }
    
    const kycCollection = collection(db, 'kyc_verifications');
    const docRef = await addDoc(kycCollection, {
      ...kycData,
      status: KYC_STATUS.PENDING,
      submittedAt: serverTimestamp(),
    });
    
    console.log("[Firestore] KYC request submitted with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("[Firestore] Error submitting KYC request:", error);
    throw error;
  }
};

export const getUserKYCStatus = async (userId: string): Promise<KYCDocument | null> => {
  try {
    console.log("[Firestore] Getting KYC status for user:", userId);
    const kycCollection = collection(db, 'kyc_verifications');
    const q = query(
      kycCollection,
      where("userId", "==", userId),
      orderBy("submittedAt", "desc"),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.log("[Firestore] No KYC request found for user:", userId);
      return null;
    }
    
    const docData = querySnapshot.docs[0].data() as Omit<KYCDocument, 'id'>;
    return {
      ...docData,
      id: querySnapshot.docs[0].id,
    };
  } catch (error) {
    console.error("[Firestore] Error getting KYC status:", error);
    return null;
  }
};

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

// KYC Settings Management
export const updateKYCSettings = async (isEnabled: boolean): Promise<boolean> => {
  try {
    console.log("[Firestore] Updating KYC settings, enabled:", isEnabled);
    const settingsRef = doc(db, 'app_settings', 'kyc');
    
    await updateDoc(settingsRef, {
      isEnabled,
      updatedAt: serverTimestamp(),
    });
    
    console.log("[Firestore] KYC settings updated successfully");
    return true;
  } catch (error) {
    console.error("[Firestore] Error updating KYC settings:", error);
    
    // If the document doesn't exist, create it
    try {
      const settingsRef = doc(db, 'app_settings', 'kyc');
      await updateDoc(settingsRef, {
        isEnabled,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (innerError) {
      console.error("[Firestore] Error creating KYC settings:", innerError);
      return false;
    }
  }
};

export const getKYCSettings = async (): Promise<{isEnabled: boolean}> => {
  try {
    console.log("[Firestore] Getting KYC settings");
    const settingsRef = doc(db, 'app_settings', 'kyc');
    const docSnap = await getDoc(settingsRef);
    
    if (!docSnap.exists()) {
      console.log("[Firestore] KYC settings not found, creating default");
      // Create default settings if not found
      await updateDoc(settingsRef, {
        isEnabled: false,
        updatedAt: serverTimestamp(),
      });
      return { isEnabled: false };
    }
    
    const data = docSnap.data();
    return { isEnabled: data.isEnabled };
  } catch (error) {
    console.error("[Firestore] Error getting KYC settings:", error);
    return { isEnabled: false };
  }
};
