
import React from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign } from 'lucide-react';

interface CommissionTabProps {
  totalCommission: number;
  commissionBreakdown: any;
  commissionHistory: any[];
  refreshCommissionData: () => Promise<void>;
}

const CommissionTab: React.FC<CommissionTabProps> = ({ 
  totalCommission, 
  commissionBreakdown, 
  commissionHistory,
  refreshCommissionData
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg mb-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-lg">Referral Commissions</h3>
        </div>
        <p className="text-sm text-gray-700 mb-2">
          Earn commission on all earnings from users in your 5-level referral network who purchase arbitrage plans.
        </p>
        
        <div className="flex justify-between items-center">
          <div className="text-sm bg-white bg-opacity-60 p-2 rounded text-gray-700">
            Total commissions earned: <span className="font-medium">{totalCommission.toFixed(2)} USDT</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshCommissionData}
            className="bg-white bg-opacity-70 text-xs"
          >
            Refresh Data
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-blue-50 p-2 rounded-lg">
          <p className="text-xs text-gray-600">Level 1</p>
          <p className="font-medium">{commissionBreakdown.level1.toFixed(2)} USDT</p>
        </div>
        
        <div className="bg-green-50 p-2 rounded-lg">
          <p className="text-xs text-gray-600">Level 2</p>
          <p className="font-medium">{commissionBreakdown.level2.toFixed(2)} USDT</p>
        </div>
        
        <div className="bg-purple-50 p-2 rounded-lg">
          <p className="text-xs text-gray-600">Level 3</p>
          <p className="font-medium">{commissionBreakdown.level3.toFixed(2)} USDT</p>
        </div>
        
        <div className="bg-orange-50 p-2 rounded-lg">
          <p className="text-xs text-gray-600">Level 4</p>
          <p className="font-medium">{commissionBreakdown.level4.toFixed(2)} USDT</p>
        </div>
        
        <div className="bg-indigo-50 p-2 rounded-lg">
          <p className="text-xs text-gray-600">Level 5</p>
          <p className="font-medium">{commissionBreakdown.level5.toFixed(2)} USDT</p>
        </div>
        
        <div className="bg-yellow-50 p-2 rounded-lg">
          <p className="text-xs text-gray-600">Total</p>
          <p className="font-medium">{totalCommission.toFixed(2)} USDT</p>
        </div>
      </div>
      
      <h3 className="text-md font-medium">Commission History</h3>
      {commissionHistory.length === 0 ? (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">
            No commissions earned yet. When your referred users earn from plans, you'll receive commission based on your level.
          </p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <div className="grid grid-cols-5 bg-gray-50 p-2 text-xs font-medium text-gray-700">
            <div>User</div>
            <div>Amount</div>
            <div>Level</div>
            <div>Plan</div>
            <div>Date</div>
          </div>
          <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
            {commissionHistory.map(commission => (
              <div key={commission.id} className="grid grid-cols-5 p-2 text-xs">
                <div className="truncate">{commission.referredId}</div>
                <div className="font-medium">{commission.amount.toFixed(2)} USDT</div>
                <div>Level {commission.level || 1}</div>
                <div>{commission.planId}</div>
                <div>{new Date(commission.timestamp).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionTab;
