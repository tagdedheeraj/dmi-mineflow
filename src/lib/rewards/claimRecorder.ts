
import { 
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';

// Function to record a claim
export const recordPlanClaim = async (userId: string, planId: string, amount: number): Promise<boolean> => {
  try {
    console.log(`Recording claim for plan ${planId} by user ${userId} for amount ${amount}`);
    const claimsCollection = collection(db, 'plan_claims');
    
    await addDoc(claimsCollection, {
      userId,
      planId,
      amount,
      timestamp: serverTimestamp()
    });
    
    console.log(`Recorded claim for plan ${planId} by user ${userId} for amount ${amount}`);
    return true;
  } catch (error) {
    console.error("Error recording claim:", error);
    return false;
  }
};

// Function to get all claims for a user
export const getUserClaims = async (userId: string): Promise<any[]> => {
  try {
    const claimsCollection = collection(db, 'plan_claims');
    const q = query(
      claimsCollection,
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || null
    }));
  } catch (error) {
    console.error("Error getting user claims:", error);
    return [];
  }
};
