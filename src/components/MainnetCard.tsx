
import React from 'react';
import { CalendarIcon } from 'lucide-react';

interface MainnetCardProps {
  launchDate: Date;
  daysLeft: number;
}

const MainnetCard: React.FC<MainnetCardProps> = ({ launchDate, daysLeft }) => {
  // Calculate progress percentage (based on 365 days countdown)
  const progressPercentage = Math.max(0, Math.min(100, ((365 - daysLeft) / 365) * 100));
  
  // Format date to display
  const formattedDate = launchDate.toLocaleString('default', { 
    month: 'long', 
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
          <div className="h-2.5 bg-black/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainnetCard;
