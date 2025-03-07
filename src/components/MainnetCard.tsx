
import React from 'react';
import { CalendarIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface MainnetCardProps {
  launchDate: Date;
}

const MainnetCard: React.FC<MainnetCardProps> = ({ launchDate }) => {
  // Get today's date
  const today = new Date();
  
  // Calculate days left until mainnet launch
  const diffTime = launchDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Calculate progress percentage (based on total days from a year before launch)
  const totalDays = 365; // Assuming we start counting a year before launch
  const daysPassed = totalDays - daysLeft;
  const progressPercentage = Math.max(0, Math.min(100, (daysPassed / totalDays) * 100));
  
  // Format date to display - ensure it shows August 26, 2025
  const formattedDate = launchDate.toLocaleString('default', { 
    month: 'long',
    day: 'numeric',
    year: 'numeric' 
  });

  return (
    <div className="w-full rounded-xl overflow-hidden card-hover-effect bg-gradient-to-br from-dmi/90 to-dmi-dark/90 text-white shadow-lg border border-dmi-light/30 animate-fade-in">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium flex items-center">
              <span className="bg-white/20 text-xs font-semibold px-2 py-1 rounded-md mr-2">
                Upcoming
              </span>
              DMI Mainnet Launch
            </h3>
            <p className="text-2xl font-bold mt-2">{formattedDate}</p>
          </div>
          <div className="bg-white/10 p-2 rounded-lg">
            <CalendarIcon className="h-5 w-5" />
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-1.5">
            <span>Progress to launch</span>
            <span className="font-semibold">{daysLeft} days left</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2.5 bg-black/20" 
          />
        </div>
      </div>
    </div>
  );
};

export default MainnetCard;
