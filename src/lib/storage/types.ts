
/**
 * Common types for the storage service
 */

export interface User {
  id: string;
  fullName: string;
  email: string;
  balance: number;
  createdAt: number;
  usdtAddress?: string;
  usdtEarnings?: number;
  deviceId?: string;
  suspended?: boolean;
  suspendedReason?: string;
  referralCode?: string;
  appliedReferralCode?: string;
  referredBy?: string;
}

export interface MiningSession {
  id?: string;
  startTime: number;
  endTime: number;
  rate: number;
  earned: number;
  status: 'active' | 'completed' | 'pending';
}

export interface ActivePlan {
  id: string;
  purchasedAt: string;
  expiresAt: string;
  boostMultiplier: number;
  duration: number;
  lastClaimed?: number; // Timestamp of last claim
  nextClaimTime?: number; // Timestamp when next claim is available
}

export interface DeviceRegistration {
  deviceId: string;
  accountIds: string[];
  firstAccountCreatedAt: number;
}

export const STORAGE_KEYS = {
  USER: 'dmi_user',
  CURRENT_MINING: 'dmi_current_mining',
  MINING_HISTORY: 'dmi_mining_history',
  ACTIVE_PLANS: 'dmi_active_plans',
  DEVICE_REGISTRATIONS: 'dmi_device_registrations',
  DEVICE_ID: 'dmi_device_id'
};
