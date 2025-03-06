
import React from 'react';
import ReferAndEarnCard from './ReferAndEarnCard';
import DMIRewardsCard from './DMIRewardsCard';

const RewardsCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ReferAndEarnCard />
      <DMIRewardsCard />
    </div>
  );
};

export default RewardsCards;
