
import { collection, getDocs, query, where, addDoc, orderBy, limit, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { KYC_STATUS, KYCDocument } from "./types";

// User-facing KYC functions
export const submitKYCRequest = async (kycData: Omit<KYCDocument, 'status' | 'submittedAt' | 'id'>): Promise<string> => {
  try {
    console.log("[Firestore] Submitting KYC request for user:", kycData.userId);
    
    // Check if user already has a KYC request
    const existingRequest = await getUserKYCStatus(kycData.userId);
    if (existingRequest) {
      console.log("[Firestore] User already has a KYC request:", existingRequest.status);
      
      // If status is 'rejected', update the existing KYC document instead of creating a new one
      if (existingRequest.status === KYC_STATUS.REJECTED) {
        console.log("[Firestore] Updating rejected KYC request to resubmitted");
        
        const kycRef = doc(db, 'kyc_verifications', existingRequest.id);
        await updateDoc(kycRef, {
          ...kycData,
          status: KYC_STATUS.PENDING,
          submittedAt: serverTimestamp(),
          // Clear the rejection data
          rejectionReason: null,
          reviewedAt: null,
          reviewedBy: null
        });
        
        return existingRequest.id;
      } else if (existingRequest.status === KYC_STATUS.PENDING) {
        throw new Error("You already have a pending KYC verification request");
      } else if (existingRequest.status === KYC_STATUS.APPROVED) {
        throw new Error("You are already KYC verified");
      }
    }
    
    // Create a new KYC document if there's no existing one or if it's not in a rejected state
    const kycCollection = collection(db, 'kyc_verifications');
    const docRef = await addDoc(kycCollection, {
      ...kycData,
      status: KYC_STATUS.PENDING,
      submittedAt: serverTimestamp()
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
