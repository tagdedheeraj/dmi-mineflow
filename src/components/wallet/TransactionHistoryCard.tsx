
import React from 'react';
import { History, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { WithdrawalRequest } from '@/lib/withdrawalTypes';

interface TransactionHistoryCardProps {
  withdrawalRequests: WithdrawalRequest[];
}

const TransactionHistoryCard: React.FC<TransactionHistoryCardProps> = ({ 
  withdrawalRequests 
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="border-b border-gray-100 p-5">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center mr-4">
            <History className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">USDT Transactions</h2>
            <p className="text-sm text-gray-500">Your withdrawal history</p>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        {withdrawalRequests.length > 0 ? (
          <div className="space-y-4">
            {withdrawalRequests.map(request => (
              <div key={request.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-gray-900 font-medium">{formatCurrency(request.amount)}</div>
                    <div className="text-gray-500 text-sm">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(request.status)}
                  </div>
                </div>
                {request.status === 'rejected' && request.rejectionReason && (
                  <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
                    <span>{request.rejectionReason}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No transactions yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Your withdrawal history will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistoryCard;
