
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserData, UserPlan } from '../types/userManagement';

// Format plans for display
export const formatPlans = (plans?: UserPlan[]): string => {
  if (!plans || plans.length === 0) return "No active plans";
  return plans.map(p => `${p.planId} (${p.boostMultiplier}x, expires: ${p.expiresAt})`).join(", ");
};

// Fetch all users with their referrals and active plans
export const fetchAllUsers = async (): Promise<UserData[]> => {
  try {
    const usersCollection = collection(db, 'users');
    const userSnapshot = await getDocs(usersCollection);
    
    const usersData: UserData[] = [];
    
    for (const userDoc of userSnapshot.docs) {
      const userData = userDoc.data();
      
      // Fetch referral count
      let referralCount = 0;
      try {
        const referralsRef = collection(db, 'referrals');
        const referralsSnapshot = await getDocs(referralsRef);
        referralCount = referralsSnapshot.docs.filter(
          doc => doc.data().referrerId === userDoc.id && doc.data().level === 1
        ).length;
      } catch (err) {
        console.error("Error fetching referrals:", err);
      }
      
      // Fetch active plans
      let activePlans: UserPlan[] = [];
      try {
        const plansRef = collection(db, 'active_plans');
        const plansSnapshot = await getDocs(plansRef);
        const now = new Date();
        
        activePlans = plansSnapshot.docs
          .filter(doc => doc.data().userId === userDoc.id)
          .map(doc => {
            const plan = doc.data();
            return {
              planId: plan.planId,
              expiresAt: new Date(plan.expiresAt).toLocaleDateString(),
              boostMultiplier: plan.boostMultiplier
            };
          })
          .filter(plan => new Date(plan.expiresAt) > now);
      } catch (err) {
        console.error("Error fetching plans:", err);
      }
      
      usersData.push({
        id: userDoc.id,
        fullName: userData.fullName || 'Unknown',
        email: userData.email || 'Unknown',
        balance: userData.balance || 0,
        usdtEarnings: userData.usdtEarnings || 0,
        referralCount,
        activePlans: activePlans.length > 0 ? activePlans : undefined,
        suspended: userData.suspended || false,
        suspendedReason: userData.suspendedReason
      });
    }
    
    return usersData;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};
