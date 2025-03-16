
import { 
  doc, 
  getDoc, 
  updateDoc, 
  addDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";
import { updateUserBalance } from './userOperations';
import {
  REFERRAL_REWARD_COINS_LEVEL1,
  REFERRAL_REWARD_COINS_LEVEL2,
  REFERRAL_REWARD_COINS_LEVEL3,
  REFERRAL_REWARD_COINS_LEVEL4,
  REFERRAL_REWARD_COINS_LEVEL5,
  REFERRAL_REWARD_COINS_LEVEL1_PREMIUM,
  REFERRAL_REWARD_COINS_LEVEL2_PREMIUM,
  REFERRAL_REWARD_COINS_LEVEL3_PREMIUM,
  REFERRAL_REWARD_COINS_LEVEL4_PREMIUM,
  REFERRAL_REWARD_COINS_LEVEL5_PREMIUM
} from '../rewards/referralCommissions';

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
    
    // Check if referrer has premium plan status
    const isPremium = await hasPremiumPlan(referrerId);
    
    // Award the bonus to the referrer based on premium status (Level 1)
    const LEVEL1_BONUS = isPremium ? REFERRAL_REWARD_COINS_LEVEL1_PREMIUM : REFERRAL_REWARD_COINS_LEVEL1;
    await updateUserBalance(referrerId, LEVEL1_BONUS);
    
    // Record the referral
    const referralsCollection = collection(db, 'referrals');
    await addDoc(referralsCollection, {
      referrerId: referrerId,
      referredId: userId,
      level: 1,
      referralCode: referralCode,
      bonusAmount: LEVEL1_BONUS,
      timestamp: serverTimestamp()
    });
    
    // Process up to 5 levels of referrals
    let currentReferrerId = referrerId;
    let currentLevel = 2;
    
    while (currentLevel <= 5) {
      // Try to get the referrer of the current referrer
      const currentReferrerRef = doc(db, 'users', currentReferrerId);
      const currentReferrerSnap = await getDoc(currentReferrerRef);
      
      if (!currentReferrerSnap.exists() || !currentReferrerSnap.data().referredBy) {
        // No more referrers in the chain
        break;
      }
      
      // Get higher level referrer
      const higherReferrerId = currentReferrerSnap.data().referredBy;
      
      // Check if the higher level referrer has premium status
      const isHigherReferrerPremium = await hasPremiumPlan(higherReferrerId);
      
      // Determine the bonus amount based on level and premium status
      let bonusAmount = 0;
      
      if (currentLevel === 2) {
        bonusAmount = isHigherReferrerPremium ? REFERRAL_REWARD_COINS_LEVEL2_PREMIUM : REFERRAL_REWARD_COINS_LEVEL2;
      } else if (currentLevel === 3) {
        bonusAmount = isHigherReferrerPremium ? REFERRAL_REWARD_COINS_LEVEL3_PREMIUM : REFERRAL_REWARD_COINS_LEVEL3;
      } else if (currentLevel === 4) {
        bonusAmount = isHigherReferrerPremium ? REFERRAL_REWARD_COINS_LEVEL4_PREMIUM : REFERRAL_REWARD_COINS_LEVEL4;
      } else if (currentLevel === 5) {
        bonusAmount = isHigherReferrerPremium ? REFERRAL_REWARD_COINS_LEVEL5_PREMIUM : REFERRAL_REWARD_COINS_LEVEL5;
      }
      
      // Award the bonus to the higher level referrer
      if (bonusAmount > 0) {
        await updateUserBalance(higherReferrerId, bonusAmount);
        
        // Record the referral at this level
        await addDoc(referralsCollection, {
          referrerId: higherReferrerId,
          referredId: userId,
          level: currentLevel,
          referralCode: currentReferrerSnap.data().appliedReferralCode,
          bonusAmount: bonusAmount,
          timestamp: serverTimestamp()
        });
      }
      
      // Move up one level
      currentReferrerId = higherReferrerId;
      currentLevel++;
    }
    
    return { 
      success: true, 
      message: `Referral code applied! ${referrerDoc.data().fullName || 'User'} has received a ${LEVEL1_BONUS} DMI bonus.` 
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
    
    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      const referredUserRef = await getDoc(doc(db, 'users', data.referredId));
      
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
    for (const docSnapshot of l1QuerySnapshot.docs) {
      const data = docSnapshot.data();
      const referredUserRef = await getDoc(doc(db, 'users', data.referredId));
      
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
          const l2UserRef = await getDoc(doc(db, 'users', l2Data.referredId));
          
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

// Helper function to check if a user has a premium plan
export const hasPremiumPlan = async (userId: string): Promise<boolean> => {
  try {
    const plansRef = collection(db, 'plans');
    const q = query(
      plansRef, 
      where("userId", "==", userId),
      where("planCost", ">=", 100) // Using constant value directly to avoid circular dependency
    );
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking premium plan:", error);
    return false;
  }
};
