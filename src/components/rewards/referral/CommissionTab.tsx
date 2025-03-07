
import React from 'react';
import { Coins, DollarSign } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { 
  REFERRAL_COMMISSION_RATE_LEVEL1,
  REFERRAL_COMMISSION_RATE_LEVEL1_PREMIUM,
  REFERRAL_COMMISSION_RATE_LEVEL2,
  REFERRAL_COMMISSION_RATE_LEVEL3,
  REFERRAL_COMMISSION_RATE_LEVEL4,
  REFERRAL_COMMISSION_RATE_LEVEL5
} from '@/lib/rewards/referralCommissions';

interface CommissionTabProps {
  totalCommission: number;
  commissionBreakdown: any;
  commissionHistory: any[];
  isPremium: boolean;
}

const CommissionTab: React.FC<CommissionTabProps> = ({ 
  totalCommission, 
  commissionBreakdown, 
  commissionHistory, 
  isPremium 
}) => {
  return (
    <div className="p-4 space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-gray-100 shadow-sm mb-4">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-lg text-gray-800">Referral Commissions</h3>
        </div>
        <p className="text-sm text-gray-700 mb-3">
          Earn commission on all earnings from users in your 5-level referral network who purchase arbitrage plans.
        </p>
        <div className="flex items-center justify-between px-4 py-3 bg-white rounded-lg">
          <span className="text-sm text-gray-600">Total commissions earned:</span>
          <span className="font-medium text-lg text-green-600">{totalCommission.toFixed(2)} USDT</span>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm mb-4">
        <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
          <Coins className="h-5 w-5 mr-2 text-amber-500" />
          Commission Breakdown by Level
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
          <div className="relative overflow-hidden bg-white border border-blue-100 rounded-lg p-3">
            <div className="absolute inset-0 bg-blue-50 opacity-50"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-1">
                <div className="bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-blue-700">1</div>
                <p className="ml-2 text-sm font-semibold text-blue-700">Level 1</p>
              </div>
              <p className="font-medium text-lg text-blue-800">{commissionBreakdown.level1.toFixed(2)} USDT</p>
              <p className="text-xs text-blue-600">{(isPremium ? REFERRAL_COMMISSION_RATE_LEVEL1_PREMIUM : REFERRAL_COMMISSION_RATE_LEVEL1) * 100}% rate</p>
            </div>
          </div>
          
          <div className="relative overflow-hidden bg-white border border-green-100 rounded-lg p-3">
            <div className="absolute inset-0 bg-green-50 opacity-50"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-1">
                <div className="bg-green-100 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-green-700">2</div>
                <p className="ml-2 text-sm font-semibold text-green-700">Level 2</p>
              </div>
              <p className="font-medium text-lg text-green-800">{commissionBreakdown.level2.toFixed(2)} USDT</p>
              <p className="text-xs text-green-600">{REFERRAL_COMMISSION_RATE_LEVEL2 * 100}% rate</p>
            </div>
          </div>
          
          <div className="relative overflow-hidden bg-white border border-purple-100 rounded-lg p-3">
            <div className="absolute inset-0 bg-purple-50 opacity-50"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-1">
                <div className="bg-purple-100 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-purple-700">3</div>
                <p className="ml-2 text-sm font-semibold text-purple-700">Level 3</p>
              </div>
              <p className="font-medium text-lg text-purple-800">{commissionBreakdown.level3.toFixed(2)} USDT</p>
              <p className="text-xs text-purple-600">{REFERRAL_COMMISSION_RATE_LEVEL3 * 100}% rate</p>
            </div>
          </div>
          
          <div className="relative overflow-hidden bg-white border border-orange-100 rounded-lg p-3">
            <div className="absolute inset-0 bg-orange-50 opacity-50"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-1">
                <div className="bg-orange-100 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-orange-700">4</div>
                <p className="ml-2 text-sm font-semibold text-orange-700">Level 4</p>
              </div>
              <p className="font-medium text-lg text-orange-800">{commissionBreakdown.level4.toFixed(2)} USDT</p>
              <p className="text-xs text-orange-600">{REFERRAL_COMMISSION_RATE_LEVEL4 * 100}% rate</p>
            </div>
          </div>
          
          <div className="relative overflow-hidden bg-white border border-indigo-100 rounded-lg p-3">
            <div className="absolute inset-0 bg-indigo-50 opacity-50"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-1">
                <div className="bg-indigo-100 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-indigo-700">5</div>
                <p className="ml-2 text-sm font-semibold text-indigo-700">Level 5</p>
              </div>
              <p className="font-medium text-lg text-indigo-800">{commissionBreakdown.level5.toFixed(2)} USDT</p>
              <p className="text-xs text-indigo-600">{REFERRAL_COMMISSION_RATE_LEVEL5 * 100}% rate</p>
            </div>
          </div>
          
          <div className="relative overflow-hidden bg-white border border-yellow-100 rounded-lg p-3">
            <div className="absolute inset-0 bg-yellow-50 opacity-50"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-1">
                <div className="bg-yellow-100 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-yellow-700">
                  <DollarSign className="h-3 w-3" />
                </div>
                <p className="ml-2 text-sm font-semibold text-yellow-700">Total</p>
              </div>
              <p className="font-medium text-lg text-yellow-800">{totalCommission.toFixed(2)} USDT</p>
              <p className="text-xs text-yellow-600">All levels combined</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
        <h3 className="text-md font-medium text-gray-700 mb-3">Commission History</h3>
        
        {commissionHistory.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <DollarSign className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 font-medium">No commissions yet</p>
            <p className="text-sm text-gray-500 mt-1">
              When your referred users earn from plans, you'll receive commission based on your level.
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs font-medium">User</TableHead>
                  <TableHead className="text-xs font-medium">Amount</TableHead>
                  <TableHead className="text-xs font-medium">Level</TableHead>
                  <TableHead className="text-xs font-medium">Plan</TableHead>
                  <TableHead className="text-xs font-medium">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissionHistory.map(commission => (
                  <TableRow key={commission.id}>
                    <TableCell className="text-xs truncate">{commission.referredId}</TableCell>
                    <TableCell className="text-xs font-medium">{commission.amount.toFixed(2)} USDT</TableCell>
                    <TableCell className="text-xs">Level {commission.level || 1}</TableCell>
                    <TableCell className="text-xs">{commission.planId}</TableCell>
                    <TableCell className="text-xs">{new Date(commission.timestamp).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommissionTab;
