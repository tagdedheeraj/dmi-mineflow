
import { 
  doc, 
  getDoc, 
  updateDoc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  collection,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { updateUserBalance } from './users';

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
    
    const userData = userSnap.data() as any;
    
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
    
    // Award the bonus to the referrer (Level 1 = 200 DMI)
    const REFERRAL_BONUS_L1 = 200;
    await updateUserBalance(referrerId, REFERRAL_BONUS_L1);
    
    // Record the referral
    const referralsCollection = collection(db, 'referrals');
    await addDoc(referralsCollection, {
      referrerId: referrerId,
      referredId: userId,
      level: 1,
      referralCode: referralCode,
      bonusAmount: REFERRAL_BONUS_L1,
      timestamp: serverTimestamp()
    });
    
    // Check for Level 2 bonus (referrer's referrer)
    const referrerData = referrerDoc.data();
    if (referrerData.referredBy) {
      // Award Level 2 bonus to the original referrer
      const REFERRAL_BONUS_L2 = 50;
      await updateUserBalance(referrerData.referredBy, REFERRAL_BONUS_L2);
      
      // Record the L2 referral
      await addDoc(referralsCollection, {
        referrerId: referrerData.referredBy,
        referredId: userId,
        level: 2,
        referralCode: referrerData.appliedReferralCode,
        bonusAmount: REFERRAL_BONUS_L2,
        timestamp: serverTimestamp()
      });
    }
    
    return { 
      success: true, 
      message: `Referral code applied! ${referrerDoc.data().fullName || 'User'} has received a ${REFERRAL_BONUS_L1} DMI bonus.` 
    };
  } catch (error) {
    console.error("Error applying referral code:", error);
    return { success: false, message: "An error occurred while applying the referral code." };
  }
};

export const getReferredUsers = async (userId: string): Promise<any[]> => {
  try {
    const referralsRef = collection(db, 'referrals');
    const q = query(
      referralsRef, 
      where("referrerId", "==", userId),
      where("level", "==", 1)
    );
    const querySnapshot = await getDocs(q);
    
    const referredUsers = [];
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const referredUserRef = await getDoc(doc.ref.firestore.doc('users/' + data.referredId));
      
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

export const getReferralStats = async (userId: string): Promise<any> => {
  try {
    // Get Level 1 referrals
    const l1ReferralsRef = collection(db, 'referrals');
    const l1Query = query(
      l1ReferralsRef, 
      where("referrerId", "==", userId),
      where("level", "==", 1)
    );
    const l1QuerySnapshot = await getDocs(l1Query);
    const level1Count = l1QuerySnapshot.size;
    
    // Get Level 2 referrals
    const l2ReferralsRef = collection(db, 'referrals');
    const l2Query = query(
      l2ReferralsRef, 
      where("referrerId", "==", userId),
      where("level", "==", 2)
    );
    const l2QuerySnapshot = await getDocs(l2Query);
    const level2Count = l2QuerySnapshot.size;
    
    // Calculate total earnings from referrals
    let totalEarnings = 0;
    
    // Add Level 1 earnings
    l1QuerySnapshot.forEach(doc => {
      const data = doc.data();
      totalEarnings += data.bonusAmount || 0;
    });
    
    // Add Level 2 earnings
    l2QuerySnapshot.forEach(doc => {
      const data = doc.data();
      totalEarnings += data.bonusAmount || 0;
    });
    
    return {
      totalReferrals: level1Count + level2Count,
      level1Count,
      level2Count,
      totalEarnings
    };
  } catch (error) {
    console.error("Error getting referral stats:", error);
    return {
      totalReferrals: 0,
      level1Count: 0,
      level2Count: 0,
      totalEarnings: 0
    };
  }
};

export const getReferralNetwork = async (userId: string): Promise<any[]> => {
  try {
    const network = [];
    
    // Get Level 1 referrals
    const l1ReferralsRef = collection(db, 'referrals');
    const l1Query = query(
      l1ReferralsRef, 
      where("referrerId", "==", userId),
      where("level", "==", 1)
    );
    const l1QuerySnapshot = await getDocs(l1Query);
    
    // Add Level 1 users to network
    for (const doc of l1QuerySnapshot.docs) {
      const data = doc.data();
      const referredUserRef = await getDoc(doc.ref.firestore.doc('users/' + data.referredId));
      
      if (referredUserRef.exists()) {
        const userData = referredUserRef.data();
        network.push({
          id: data.referredId,
          name: userData.fullName,
          level: 1,
          parentId: userId
        });
        
        // Get Level 2 referrals (users referred by this level 1 user)
        const l2ReferralsRef = collection(db, 'referrals');
        const l2Query = query(
          l2ReferralsRef, 
          where("referrerId", "==", data.referredId),
          where("level", "==", 1)
        );
        const l2QuerySnapshot = await getDocs(l2Query);
        
        // Add Level 2 users to network
        for (const l2Doc of l2QuerySnapshot.docs) {
          const l2Data = l2Doc.data();
          const l2UserRef = await getDoc(l2Doc.ref.firestore.doc('users/' + l2Data.referredId));
          
          if (l2UserRef.exists()) {
            const l2UserData = l2UserRef.data();
            network.push({
              id: l2Data.referredId,
              name: l2UserData.fullName,
              level: 2,
              parentId: data.referredId
            });
          }
        }
      }
    }
    
    return network;
  } catch (error) {
    console.error("Error getting referral network:", error);
    return [];
  }
};
