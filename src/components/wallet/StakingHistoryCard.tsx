
import React from 'react';
import { History, Clock, TrendingUp } from 'lucide-react';
import { StakingTransaction } from '@/lib/firestore/stakingService';
import { formatCurrency } from '@/lib/utils';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';

interface StakingHistoryCardProps {
  stakingHistory: StakingTransaction[];
  isLoading: boolean;
  totalStaked: number;
  totalEarned: number;
}

const StakingHistoryCard: React.FC<StakingHistoryCardProps> = ({
  stakingHistory,
  isLoading,
  totalStaked,
  totalEarned
}) => {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? 
      timestamp.toDate() : 
      new Date(timestamp);
      
    return date.toLocaleDateString() + ' ' + 
      date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="border-b border-gray-100 p-5">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-4">
            <History className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Staking History</h2>
            <p className="text-sm text-gray-500">Your staking transactions</p>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <TrendingUp className="h-4 w-4" />
              <span>Total Staked</span>
            </div>
            <div className="text-lg font-semibold">{formatCurrency(totalStaked)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
              <TrendingUp className="h-4 w-4" />
              <span>Total Earned</span>
            </div>
            <div className="text-lg font-semibold text-green-600">{formatCurrency(totalEarned)}</div>
          </div>
        </div>
      
        {isLoading ? (
          <div className="text-center py-6">
            <p className="text-gray-500">Loading staking history...</p>
          </div>
        ) : stakingHistory.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Daily Rate</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stakingHistory.map(transaction => (
                <TableRow key={transaction.id}>
                  <TableCell className="text-sm">{formatDate(transaction.createdAt)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell className="text-green-600">{formatCurrency(transaction.dailyRate)}/day</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                      ${transaction.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : transaction.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {transaction.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No staking history yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Your staking transactions will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StakingHistoryCard;
