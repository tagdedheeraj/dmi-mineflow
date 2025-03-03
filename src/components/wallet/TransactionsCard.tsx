
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { WithdrawalRequest } from '@/types';

interface TransactionsCardProps {
  withdrawalHistory: WithdrawalRequest[];
}

const TransactionsCard: React.FC<TransactionsCardProps> = ({ withdrawalHistory }) => {
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {withdrawalHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No recent transactions</p>
        ) : (
          <div className="space-y-4">
            {withdrawalHistory.map((transaction) => (
              <div key={transaction.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">Withdrawal Request</h4>
                    <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
                  </div>
                  {renderStatusBadge(transaction.status)}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-gray-600">
                    <p>To address: {transaction.address.substring(0, 8)}...{transaction.address.substring(transaction.address.length - 8)}</p>
                  </div>
                  <div className="font-medium">{formatCurrency(transaction.amount)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionsCard;
