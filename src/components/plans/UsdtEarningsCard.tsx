
import React from 'react';
import { Clock } from 'lucide-react';
import { ActivePlan } from '@/lib/storage';
import { MiningPlan } from '@/data/miningPlans';

interface UsdtEarningsCardProps {
  activePlans: ActivePlan[];
  miningPlans: MiningPlan[];
  dailyEarningsUpdateTime: string;
}

const UsdtEarningsCard: React.FC<UsdtEarningsCardProps> = ({ 
  activePlans, 
  miningPlans,
  dailyEarningsUpdateTime 
}) => {
  // Calculate daily, weekly, and monthly earnings from active plans
  const currentDailyEarnings = activePlans.reduce((total, plan) => {
    const planInfo = miningPlans.find(p => p.id === plan.id);
    if (planInfo && new Date() < new Date(plan.expiresAt)) {
      return total + planInfo.dailyEarnings;
    }
    return total;
  }, 0);
  
  const currentWeeklyEarnings = currentDailyEarnings * 7;
  const currentMonthlyEarnings = currentDailyEarnings * 30;

  return (
    <div className="mt-6 bg-green-50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm font-medium text-green-700">USDT Earnings from Plans</p>
      </div>
      
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-white p-2 rounded shadow-sm">
          <p className="text-xs text-gray-500">Daily</p>
          <p className="text-green-600 font-bold">${currentDailyEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-white p-2 rounded shadow-sm">
          <p className="text-xs text-gray-500">Weekly</p>
          <p className="text-green-600 font-bold">${currentWeeklyEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-white p-2 rounded shadow-sm">
          <p className="text-xs text-gray-500">Monthly</p>
          <p className="text-green-600 font-bold">${currentMonthlyEarnings.toFixed(2)}</p>
        </div>
      </div>
      
      {activePlans.length > 0 && (
        <div className="mt-3 space-y-2">
          <div className="text-sm bg-green-100 p-2 rounded-md text-green-700">
            <p className="font-medium">Active Plans: {activePlans.filter(plan => new Date() < new Date(plan.expiresAt)).length}</p>
            <p className="text-xs mt-1">You receive daily USDT earnings from each active plan</p>
          </div>
          
          <div className="flex items-center text-xs bg-blue-50 p-2 rounded-md text-blue-700">
            <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
            <span>
              Daily earnings are automatically credited at {dailyEarningsUpdateTime} every day
              (Indian Standard Time)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsdtEarningsCard;
