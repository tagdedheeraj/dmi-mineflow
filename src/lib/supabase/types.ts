
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
}

export interface MiningSession {
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
}

export interface DeviceRegistration {
  deviceId: string;
  accountIds: string[];
  firstAccountCreatedAt: number;
}
