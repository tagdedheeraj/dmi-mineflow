
import React from 'react';
import { Calendar } from 'lucide-react';
import { ActivePlan } from '@/lib/storage';
import { format } from 'date-fns';

interface ActivePlansCardProps {
  activePlans: ActivePlan[];
}

const ActivePlansCard: React.FC<ActivePlansCardProps> = ({ activePlans }) => {
  if (activePlans.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="p-5">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center mr-4">
            <Calendar className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Active Mining Plans</h2>
            <p className="text-sm text-gray-500">Your active mining speed boosts</p>
          </div>
        </div>
        
        <div className="mt-5 space-y-4">
          {activePlans.map((plan, index) => (
            <div key={index} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0">
              <div>
                <p className="font-medium">{plan.id} Plan</p>
                <p className="text-sm text-gray-500">
                  Expires: {format(new Date(plan.expiresAt), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-sm">
                {plan.boostMultiplier}x Boost
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivePlansCard;
