
export type UserPlan = {
  planId: string;
  expiresAt: string;
  boostMultiplier: number;
};

export type UserData = {
  id: string;
  fullName: string;
  email: string;
  balance: number;
  usdtEarnings: number;
  referralCount?: number;
  activePlans?: UserPlan[];
  suspended?: boolean;
  suspendedReason?: string;
};
