
import React, { useState, useEffect } from 'react';
import { Trophy, Users, Award, Star } from 'lucide-react';
import ReferralLeaderboard from '../ReferralLeaderboard';

const ContestTab: React.FC = () => {
  const [contestEndDate, setContestEndDate] = useState<Date>(new Date());
  const [daysLeft, setDaysLeft] = useState<number>(0);
  
  useEffect(() => {
    // Set end date to end of current month
    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setContestEndDate(lastDayOfMonth);
    
    // Calculate days left
    const timeLeft = lastDayOfMonth.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
    setDaysLeft(daysRemaining);
    
    // Update the days left every 24 hours
    const interval = setInterval(() => {
      const now = new Date();
      const timeLeft = lastDayOfMonth.getTime() - now.getTime();
      const daysRemaining = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
      setDaysLeft(daysRemaining);
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          <h3 className="font-semibold text-lg">Monthly Referral Contest</h3>
        </div>
        <p className="text-sm text-gray-700 mb-2">
          Join our monthly referral contest! The user with the most referrals this month wins a special prize of 5000 DMI coins!
        </p>
        <div className="text-xs bg-white bg-opacity-60 p-2 rounded text-gray-700">
          Contest ends: <span className="font-medium">{contestEndDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>
      
      <ReferralLeaderboard daysLeft={daysLeft} />
    </div>
  );
};

export default ContestTab;
