
import { 
  doc, 
  getDoc, 
  updateDoc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  collection,
  serverTimestamp,
  doc as docRef
} from "firebase/firestore";
import { db } from "../firebase";
import { updateUserBalance } from './userOperations';

// Referral operations
export const generateReferralCode = (userId: string): string => {
  // Generate a referral code based on userId and random characters
  const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `DMI${randomChars}`;
};

export const saveReferralCode = async (userId: string, code: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      referralCode: code
    });
  } catch (error) {
    console.error("Error saving referral code:", error);
  }
};

export const applyReferralCode = async (userId: string, referralCode: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Check if user has already applied a referral code
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return { success: false, message: "User not found." };
    }
    
    const userData = userSnap.data();
    
    if (userData.appliedReferralCode) {
      return { success: false, message: "You have already applied a referral code." };
    }
    
    // Find the user who owns this referral code
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("referralCode", "==", referralCode));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: false, message: "Invalid referral code." };
    }
    
    const referrerDoc = querySnapshot.docs[0];
    const referrerId = referrerDoc.id;
    
    // Make sure user is not trying to refer themselves
    if (referrerId === userId) {
      return { success: false, message: "You cannot apply your own referral code." };
    }
    
    // Mark referral code as applied for this user
    await updateDoc(userRef, {
      appliedReferralCode: referralCode,
      referredBy: referrerId
    });
    
    // Award the bonus to the referrer
    const REFERRAL_BONUS = 200;
    await updateUserBalance(referrerId, REFERRAL_BONUS);
    
    // Record the referral
    const referralsCollection = collection(db, 'referrals');
    await addDoc(referralsCollection, {
      referrerId: referrerId,
      referredId: userId,
      referralCode: referralCode,
      bonusAmount: REFERRAL_BONUS,
      timestamp: serverTimestamp()
    });
    
    return { 
      success: true, 
      message: `Referral code applied! ${referrerDoc.data().fullName || 'User'} has received a ${REFERRAL_BONUS} DMI bonus.` 
    };
  } catch (error) {
    console.error("Error applying referral code:", error);
    return { success: false, message: "An error occurred while applying the referral code." };
  }
};

export const getReferredUsers = async (userId: string): Promise<any[]> => {
  try {
    const referralsRef = collection(db, 'referrals');
    const q = query(referralsRef, where("referrerId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const referredUsers = [];
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const referredUserRef = await getDoc(docRef(db, 'users', data.referredId));
      
      if (referredUserRef.exists()) {
        const userData = referredUserRef.data();
        referredUsers.push({
          id: data.referredId,
          fullName: userData.fullName,
          email: userData.email,
          timestamp: data.timestamp
        });
      }
    }
    
    return referredUsers;
  } catch (error) {
    console.error("Error getting referred users:", error);
    return [];
  }
};
