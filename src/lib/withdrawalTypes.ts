
export interface WithdrawalRequest {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;           // Total withdrawal amount
  netAmount?: number;       // Amount after fees
  platformFee?: number;     // Platform fee amount
  platformFeePercentage?: number; // Fee percentage applied
  usdtAddress: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  processedAt?: number;
  processedBy?: string;
  rejectionReason?: string;
}
