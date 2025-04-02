
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import KYCStatusBadge from './KYCStatusBadge';
import { format } from 'date-fns';
import { KYCDocument } from '@/lib/firestore';

interface KYCRequestsTableProps {
  isLoading: boolean;
  kycRequests: KYCDocument[];
  onViewDetails: (kycId: string) => void;
  onApprove: (kycId: string) => void;
  onReject: (kycId: string) => void;
  onReset: (kycId: string) => void;
}

const KYCRequestsTable: React.FC<KYCRequestsTableProps> = ({
  isLoading,
  kycRequests,
  onViewDetails,
  onApprove,
  onReject,
  onReset,
}) => {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    if (timestamp.toDate) {
      // Firestore timestamp
      return format(timestamp.toDate(), 'PPP p');
    } else if (typeof timestamp === 'string') {
      return format(new Date(timestamp), 'PPP');
    }
    
    return 'N/A';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-dmi"></div>
      </div>
    );
  }

  if (kycRequests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertTriangle className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
        <p>No KYC requests found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left text-gray-600">Name</th>
            <th className="px-4 py-2 text-left text-gray-600">Document</th>
            <th className="px-4 py-2 text-left text-gray-600">Submitted</th>
            <th className="px-4 py-2 text-left text-gray-600">Status</th>
            <th className="px-4 py-2 text-right text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {kycRequests.map((request) => (
            <tr key={request.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-3">{request.fullName}</td>
              <td className="px-4 py-3">
                {request.documentType === 'government_id' ? 'Government ID' : 'Passport'}
              </td>
              <td className="px-4 py-3">
                {formatDate(request.submittedAt)}
              </td>
              <td className="px-4 py-3">
                <KYCStatusBadge status={request.status} />
              </td>
              <td className="px-4 py-3 text-right space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => request.id && onViewDetails(request.id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                
                {request.status === 'pending' && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-600"
                      onClick={() => request.id && onApprove(request.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => request.id && onReject(request.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
                
                {request.status === 'rejected' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600"
                    onClick={() => request.id && onReset(request.id)}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default KYCRequestsTable;
