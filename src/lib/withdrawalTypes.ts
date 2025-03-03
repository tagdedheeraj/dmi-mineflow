
export interface WithdrawalRequest {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  usdtAddress: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  processedAt?: number;
  processedBy?: string;
  rejectionReason?: string;
}
