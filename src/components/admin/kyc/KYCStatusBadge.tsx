
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface KYCStatusBadgeProps {
  status: string;
}

const KYCStatusBadge: React.FC<KYCStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-500">Approved</Badge>;
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>;
    case 'pending':
    default:
      return <Badge className="bg-yellow-500">Pending</Badge>;
  }
};

export default KYCStatusBadge;
