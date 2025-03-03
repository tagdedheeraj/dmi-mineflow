
import React from 'react';
import { History } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { WithdrawalRequest } from '@/lib/storage';

interface TransactionsCardProps {
  withdrawalHistory: WithdrawalRequest[];
}

const TransactionsCard: React.FC<TransactionsCardProps> = ({ withdrawalHistory }) => {
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
        {withdrawalHistory.length > 0 ? (
          <div className="space-y-3">
            {withdrawalHistory.map((request) => (
              <div key={request.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500 text-sm">
                    {new Date(request.createdAt).toLocaleDateString()} 
                    {' '} 
                    {new Date(request.createdAt).toLocaleTimeString()}
                  </span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900 font-medium">{formatCurrency(request.amount)}</span>
                  <span className="text-gray-500 text-sm truncate max-w-[150px]">{request.address}</span>
                </div>
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

export default TransactionsCard;
