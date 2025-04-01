
import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StakingData } from '@/types/staking';

interface StakingTableProps {
  records: StakingData[];
  calculateRemainingDays: (lockedUntil: Date) => number;
  isLoading: boolean;
  searchTerm: string;
}

const StakingTable: React.FC<StakingTableProps> = ({ 
  records, 
  calculateRemainingDays, 
  isLoading,
  searchTerm
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-dmi"></div>
      </div>
    );
  }
  
  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {searchTerm ? 'No staking records found matching your search.' : 'No staking records found in the system.'}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Amount (USDT)</TableHead>
            <TableHead>Daily Earnings</TableHead>
            <TableHead>Staked On</TableHead>
            <TableHead>Lock Status</TableHead>
            <TableHead>Total Earned</TableHead>
            <TableHead>Transaction ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => {
            const lockedDaysRemaining = calculateRemainingDays(record.lockedUntil);
            const isLocked = lockedDaysRemaining > 0;
            
            return (
              <TableRow key={record.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{record.userName}</div>
                    <div className="text-xs text-gray-500">{record.userEmail}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">${record.amount.toFixed(2)}</div>
                </TableCell>
                <TableCell>
                  <div className="text-green-600 font-medium">${record.dailyEarnings.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">1% daily</div>
                </TableCell>
                <TableCell>
                  {record.stakingDate.toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {isLocked ? (
                    <div>
                      <Badge className="bg-blue-100 text-blue-600 border-blue-200">
                        Locked
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {lockedDaysRemaining} days remaining
                      </div>
                    </div>
                  ) : (
                    <Badge className="bg-green-100 text-green-600 border-green-200">
                      Unlocked
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-green-600 font-medium">
                    ${record.totalEarned.toFixed(2)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs text-gray-500 max-w-[120px] truncate" title={record.transactionId}>
                    {record.transactionId.substring(0, 12)}...
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default StakingTable;
