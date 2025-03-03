
import React, { useState, useEffect } from 'react';
import { useMining } from '@/contexts/MiningContext';
import { Button } from '@/components/ui/button';
import { Cpu, ArrowUpCircle, Sparkles, Coins, TrendingUp } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';

const MiningCard: React.FC = () => {
  const { 
    startMining, 
    isMining, 
    miningProgress, 
    timeRemaining, 
    currentEarnings,
    miningRate
  } = useMining();
  
  // Animation for mined coins counter
  const [displayedEarnings, setDisplayedEarnings] = useState(currentEarnings);
  const [showSparkle, setShowSparkle] = useState(false);

  // Format the time remaining into hours:minutes:seconds
  const formattedTimeRemaining = formatDuration(timeRemaining);

  // Update displayed earnings with animation
  useEffect(() => {
    if (currentEarnings > displayedEarnings) {
      const interval = setInterval(() => {
        setDisplayedEarnings(prev => {
          const increment = Math.max(0.01, (currentEarnings - prev) * 0.1);
          const newValue = Math.min(currentEarnings, prev + increment);
          
          // Show sparkle animation when earnings increase
          if (newValue > prev) {
            setShowSparkle(true);
            setTimeout(() => setShowSparkle(false), 700);
          }
          
          return newValue;
        });
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [currentEarnings, displayedEarnings]);

  return (
    <div className="w-full rounded-xl overflow-hidden bg-gradient-to-br from-white to-gray-50 shadow-md border border-gray-100 card-hover-effect animate-fade-in">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <span>Mining Station</span>
              {isMining && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Start mining now to earn DMI coins. Upgrade your plan for faster mining.
            </p>
          </div>
          <div className={cn(
            "p-2 rounded-lg", 
            isMining ? "bg-dmi/10 text-dmi animate-pulse" : "bg-dmi/10 text-dmi"
          )}>
            <Cpu className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 relative overflow-hidden transition-all duration-300 transform hover:scale-[1.03]">
            <div className="absolute top-0 right-0 w-16 h-16 -mt-8 -mr-8 bg-blue-100 rounded-full opacity-50"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-1">
                <Coins className="h-4 w-4 text-blue-600 mr-1.5" />
                <p className="text-xs font-medium text-blue-600">Current Mining Balance</p>
              </div>
              <div className="flex items-end">
                <p className={cn(
                  "text-2xl font-bold text-gray-900 transition-all",
                  showSparkle && "text-dmi"
                )}>
                  {displayedEarnings.toFixed(2)}
                </p>
                <span className="text-sm font-medium text-gray-500 ml-1 mb-0.5">DMI</span>
                {showSparkle && (
                  <Sparkles className="h-4 w-4 text-yellow-500 ml-1 mb-1 animate-pulse" />
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 relative overflow-hidden transition-all duration-300 transform hover:scale-[1.03]">
            <div className="absolute top-0 right-0 w-16 h-16 -mt-8 -mr-8 bg-purple-100 rounded-full opacity-50"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-1">
                <TrendingUp className="h-4 w-4 text-purple-600 mr-1.5" />
                <p className="text-xs font-medium text-purple-600">Mining Rate</p>
              </div>
              <div className="flex items-end">
                <p className="text-2xl font-bold text-gray-900">
                  {miningRate}
                </p>
                <span className="text-sm font-medium text-gray-500 ml-1 mb-0.5">DMI/hr</span>
              </div>
            </div>
          </div>
        </div>

        {isMining ? (
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 font-medium">Mining in progress</span>
              <span className="text-gray-900 font-medium">{formattedTimeRemaining} remaining</span>
            </div>
            <div className="mining-progress-bar h-3 rounded-full overflow-hidden bg-gray-100 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-dmi/80 to-dmi rounded-full transition-all duration-500 ease-out flex items-center justify-end"
                style={{ width: `${miningProgress}%` }}
              >
                {miningProgress > 15 && (
                  <div className="h-2 w-2 rounded-full bg-white mr-1 animate-pulse"></div>
                )}
              </div>
            </div>
            
            <div className="flex justify-center mt-6">
              <div className="relative">
                <div className="absolute -top-1 -left-1 w-16 h-16 bg-dmi/5 rounded-full animate-ping opacity-75"></div>
                <div className="rounded-full w-14 h-14 bg-gradient-to-br from-dmi to-dmi-dark flex items-center justify-center shadow-md relative z-10">
                  <Cpu className="h-6 w-6 text-white animate-pulse" />
                </div>
                
                {/* Mining particles */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute h-1.5 w-1.5 bg-yellow-400 rounded-full opacity-0"
                      style={{
                        animation: `mining-particle-${i+1} 3s ease-out infinite`,
                        animationDelay: `${i * 0.6}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <style jsx>{`
              @keyframes mining-particle-1 {
                0% { transform: translate(0, 0); opacity: 0; }
                20% { opacity: 1; }
                100% { transform: translate(-30px, -30px); opacity: 0; }
              }
              @keyframes mining-particle-2 {
                0% { transform: translate(0, 0); opacity: 0; }
                20% { opacity: 1; }
                100% { transform: translate(30px, -25px); opacity: 0; }
              }
              @keyframes mining-particle-3 {
                0% { transform: translate(0, 0); opacity: 0; }
                20% { opacity: 1; }
                100% { transform: translate(-25px, 30px); opacity: 0; }
              }
              @keyframes mining-particle-4 {
                0% { transform: translate(0, 0); opacity: 0; }
                20% { opacity: 1; }
                100% { transform: translate(25px, 25px); opacity: 0; }
              }
              @keyframes mining-particle-5 {
                0% { transform: translate(0, 0); opacity: 0; }
                20% { opacity: 1; }
                100% { transform: translate(0, -35px); opacity: 0; }
              }
            `}</style>
          </div>
        ) : (
          <Button 
            className="w-full mt-6 bg-gradient-to-r from-dmi to-dmi-dark hover:from-dmi-dark hover:to-dmi text-white flex items-center justify-center space-x-2 shadow-md button-hover-effect" 
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
