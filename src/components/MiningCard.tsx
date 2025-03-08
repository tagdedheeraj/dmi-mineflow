
import React, { useEffect } from 'react';
import { useMining } from '@/contexts/MiningContext';
import { Button } from '@/components/ui/button';
import { Cpu, ArrowUpCircle } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { notifyMiningCompleted } from '@/lib/rewards/notificationService';

const MiningCard: React.FC = () => {
  const { 
    startMining, 
    isMining, 
    miningProgress, 
    timeRemaining, 
    currentEarnings,
    miningRate,
    forceRefreshMining
  } = useMining();
  
  const { user } = useAuth();

  // Check if mining is complete
  const isMiningComplete = timeRemaining === 0 && isMining;
  
  // Auto-refresh mining state when timer reaches zero
  useEffect(() => {
    if (isMiningComplete && user?.id) {
      // When mining completes, force refresh the mining state
      forceRefreshMining();
    }
  }, [isMiningComplete, user?.id, forceRefreshMining]);

  // Format the time remaining into hours:minutes:seconds
  const formattedTimeRemaining = formatDuration(timeRemaining);
  
  // Format mining rate to 2 decimal places for display
  const formattedMiningRate = miningRate.toFixed(2);

  return (
    <div className="w-full rounded-xl overflow-hidden bg-white shadow-md border border-gray-100 card-hover-effect animate-fade-in">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Mining Station</h3>
            <p className="text-sm text-gray-500 mt-1">
              Start mining now to earn DMI coins. Upgrade your plan for faster mining.
            </p>
          </div>
          <div className="bg-dmi/10 text-dmi p-2 rounded-lg">
            <Cpu className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Current Mining Balance</p>
            <p className="text-xl font-semibold mt-1 text-gray-900">
              {currentEarnings} <span className="text-sm font-medium text-gray-500">DMI</span>
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Mining Rate</p>
            <p className="text-xl font-semibold mt-1 text-gray-900">
              {formattedMiningRate} <span className="text-sm font-medium text-gray-500">DMI/hr</span>
            </p>
          </div>
        </div>

        {isMining && timeRemaining > 0 ? (
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Mining in progress</span>
              <span className="text-gray-900 font-medium">{formattedTimeRemaining} remaining</span>
            </div>
            <div className="mining-progress-bar">
              <div 
                className="mining-progress-bar-inner"
                style={{ width: `${miningProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-center mt-4">
              <div className="rounded-full w-16 h-16 bg-dmi/10 flex items-center justify-center animate-mining">
                <Cpu className="h-8 w-8 text-dmi" />
              </div>
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              Mining at {formattedMiningRate} DMI coins per hour
            </p>
          </div>
        ) : (
          <Button 
            className="w-full mt-6 bg-dmi hover:bg-dmi-dark text-white flex items-center justify-center space-x-2 button-hover-effect" 
            onClick={startMining}
          >
            <ArrowUpCircle className="h-5 w-5" />
            <span>Start Mining Now</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default MiningCard;
