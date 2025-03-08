
// Add startDate to ActivePlan interface
export interface ActivePlan {
  id: string;
  boostMultiplier: number;
  startDate: string; // ISO date string
  expiresAt: string; // ISO date string
  active: boolean;
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
}

// Function to get the device ID
export const getDeviceId = (): string => {
  return localStorage.getItem('deviceId') || 'unknown';
};
