
export interface StakingData {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  dailyEarnings: number;
  stakingDate: Date;
  lockedUntil: Date;
  isActive: boolean;
  totalEarned: number;
  transactionId: string;
}

export interface ManualStakingFormValues {
  userEmail: string;
  amount: string;
  transactionId: string;
}
