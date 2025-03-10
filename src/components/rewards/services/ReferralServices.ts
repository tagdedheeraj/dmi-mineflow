
import {
  generateReferralCode,
  saveReferralCode,
  applyReferralCode,
  getReferredUsers,
  getReferralStats,
  getReferralNetwork
} from '@/lib/firestore';
import {
  getCommissionHistory,
  getTotalCommissionEarned,
  getCommissionBreakdown,
  hasPremiumPlan
} from '@/lib/rewards/referralCommissions';

export const fetchReferralCode = async (userId: string): Promise<string> => {
  const code = generateReferralCode(userId);
  await saveReferralCode(userId, code);
  return code;
};

export const fetchReferralData = async (userId: string) => {
  try {
    const referredUsers = await getReferredUsers(userId);
    const referralStats = await getReferralStats(userId);
    const referralNetwork = await getReferralNetwork(userId);
    const commissionHistory = await getCommissionHistory(userId);
    const totalCommission = await getTotalCommissionEarned(userId);
    const commissionBreakdown = await getCommissionBreakdown(userId);
    const isPremium = await hasPremiumPlan(userId);
    
    return {
      referredUsers,
      referralStats,
      referralNetwork,
      commissionHistory,
      totalCommission,
      commissionBreakdown,
      isPremium
    };
  } catch (error) {
    console.error("Error fetching referral data:", error);
    return {
      referredUsers: [],
      referralStats: { totalReferrals: 0, level1Count: 0, level2Count: 0, totalEarnings: 0 },
      referralNetwork: [],
      commissionHistory: [],
      totalCommission: 0,
      commissionBreakdown: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0 },
      isPremium: false
    };
  }
};

export const handleApplyReferralCode = async (userId: string, inputCode: string) => {
  if (!inputCode) {
    return { success: false, message: "Please enter a referral code." };
  }
  
  try {
    const result = await applyReferralCode(userId, inputCode);
    return result;
  } catch (error) {
    return { success: false, message: "Failed to apply referral code. Please try again." };
  }
};
