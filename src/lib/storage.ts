
// Add startDate to ActivePlan interface
export interface ActivePlan {
  id: string;
  boostMultiplier: number;
  startDate: string; // ISO date string
  expiresAt: string; // ISO date string
  active: boolean;
  purchasedAt?: string; // Add this to fix Wallet.tsx error
}

// Add User interface to fix type errors
export interface User {
  id: string;
  email: string;
  fullName?: string;
  balance: number;
  usdtEarnings?: number;
  usdtAddress?: string;
  referredBy?: string;
  lastUsdtEarningsUpdate?: string;
  suspended?: boolean;
  suspendedReason?: string;
  referralCode?: string; // Add this to fix ReferralSystem.tsx errors
  appliedReferralCode?: string; // Add this to fix ReferralSystem.tsx errors
  createdAt?: string; // Add this to fix AuthContext and Profile errors
}

// Add MiningSession interface
export interface MiningSession {
  id?: string;
  startTime: number;
  endTime: number;
  rate: number;
  earned: number;
  status: 'active' | 'completed' | 'cancelled';
}

// Add DeviceRegistration interface
export interface DeviceRegistration {
  id: string;
  deviceId: string;
  firstAccountCreatedAt: Date;
  accountIds?: string[]; // Add this to fix firestore.ts errors
}

// Function to get the device ID
export const getDeviceId = (): string => {
  return localStorage.getItem('deviceId') || 'unknown';
};
