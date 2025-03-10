
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchReferralCode, fetchReferralData } from '../services/ReferralServices';

export const useReferralSystem = () => {
  const { user, updateUser } = useAuth();
  const [referralCode, setReferralCode] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [referredUsers, setReferredUsers] = useState<any[]>([]);
  const [referralStats, setReferralStats] = useState<any>({ 
    totalReferrals: 0, 
    level1Count: 0, 
    level2Count: 0, 
    totalEarnings: 0 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [referralNetwork, setReferralNetwork] = useState<any[]>([]);
  const [commissionHistory, setCommissionHistory] = useState<any[]>([]);
  const [totalCommission, setTotalCommission] = useState(0);
  const [commissionBreakdown, setCommissionBreakdown] = useState<any>({
    level1: 0,
    level2: 0,
    level3: 0,
    level4: 0,
    level5: 0
  });
  const [isPremium, setIsPremium] = useState(false);
  
  useEffect(() => {
    const loadReferralData = async () => {
      if (user) {
        // Handle referral code
        if (!user.referralCode) {
          try {
            const code = await fetchReferralCode(user.id);
            setReferralCode(code);
            updateUser({ ...user, referralCode: code });
          } catch (error) {
            console.error("Error generating referral code:", error);
          }
        } else {
          setReferralCode(user.referralCode);
        }
        
        // Load all referral related data
        try {
          const data = await fetchReferralData(user.id);
          setReferredUsers(data.referredUsers || []);
          setReferralStats(data.referralStats || { totalReferrals: 0, level1Count: 0, level2Count: 0, totalEarnings: 0 });
          setReferralNetwork(data.referralNetwork || []);
          setCommissionHistory(data.commissionHistory || []);
          setTotalCommission(data.totalCommission || 0);
          setCommissionBreakdown(data.commissionBreakdown || { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0 });
          setIsPremium(data.isPremium || false);
        } catch (error) {
          console.error("Error loading referral data:", error);
        }
      }
    };
    
    loadReferralData();
  }, [user, updateUser]);
  
  return {
    user,
    updateUser,
    referralCode,
    inputCode,
    setInputCode,
    referredUsers,
    referralStats,
    isSubmitting,
    setIsSubmitting,
    activeTab,
    setActiveTab,
    referralNetwork,
    commissionHistory,
    totalCommission,
    commissionBreakdown,
    isPremium
  };
};

export default useReferralSystem;
