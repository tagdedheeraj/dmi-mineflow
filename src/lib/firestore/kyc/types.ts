
// KYC Status constants
export const KYC_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// KYC Document type
export type KYCDocument = {
  id?: string;
  userId: string;
  fullName: string;
  idNumber: string;
  address: string;
  documentType: 'government_id' | 'passport';
  documentExpiryDate: string;
  frontImageUrl: string;
  backImageUrl: string;
  selfieImageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt: any;
  reviewedAt?: any;
  reviewedBy?: string;
};
