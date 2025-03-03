
export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  balance: number;
  usdtAddress?: string;
  usdtEarnings: number;
  isAdmin?: boolean;
  deviceId?: string;
  fullName?: string;
  createdAt?: number;
  suspended?: boolean;
  suspendedReason?: string;
}

export interface MiningSession {
  startTime: number;
  endTime: number;
  rate: number;
  earned: number;
  status: 'active' | 'completed';
}

export interface ActivePlan {
  id: string;
  purchasedAt: string;
  expiresAt: string;
  boostMultiplier: number;
  duration: number;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  processedAt?: number;
}
