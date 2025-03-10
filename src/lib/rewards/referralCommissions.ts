
// This file re-exports all the referral commission functionality from the modular files
import { PREMIUM_PLAN_THRESHOLD } from './constants/referralRates';
import { hasPremiumPlan } from './utils/userUtils';
import { 
  awardReferralCommission 
} from './commission/commissionProcessor';
import { 
  awardPlanPurchaseCommission 
} from './commission/planPurchaseCommission';
import {
  getCommissionHistory,
  getTotalCommissionEarned,
  getCommissionBreakdown
} from './reporting/commissionReporting';
import * as rates from './constants/referralRates';

// Re-export everything
export {
  // Constants
  PREMIUM_PLAN_THRESHOLD,
  // Commission rates
  rates.REFERRAL_COMMISSION_RATE_LEVEL1,
  rates.REFERRAL_COMMISSION_RATE_LEVEL1_PREMIUM,
  rates.REFERRAL_COMMISSION_RATE_LEVEL2,
  rates.REFERRAL_COMMISSION_RATE_LEVEL3,
  rates.REFERRAL_COMMISSION_RATE_LEVEL4,
  rates.REFERRAL_COMMISSION_RATE_LEVEL5,
  // DMI Coin rewards
  rates.REFERRAL_REWARD_COINS_LEVEL1,
  rates.REFERRAL_REWARD_COINS_LEVEL1_PREMIUM,
  rates.REFERRAL_REWARD_COINS_LEVEL2,
  rates.REFERRAL_REWARD_COINS_LEVEL2_PREMIUM,
  rates.REFERRAL_REWARD_COINS_LEVEL3,
  rates.REFERRAL_REWARD_COINS_LEVEL3_PREMIUM,
  rates.REFERRAL_REWARD_COINS_LEVEL4,
  rates.REFERRAL_REWARD_COINS_LEVEL4_PREMIUM,
  rates.REFERRAL_REWARD_COINS_LEVEL5,
  rates.REFERRAL_REWARD_COINS_LEVEL5_PREMIUM,
  // User utility functions
  hasPremiumPlan,
  // Commission functions
  awardReferralCommission,
  awardPlanPurchaseCommission,
  // Reporting functions
  getCommissionHistory,
  getTotalCommissionEarned,
  getCommissionBreakdown
};
