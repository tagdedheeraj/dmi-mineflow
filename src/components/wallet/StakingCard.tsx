
import React, { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DMI_COIN_VALUE } from '@/data/miningPlans';
import useStakingData from '@/hooks/wallet/useStakingData';

// Import smaller components
import StakingAlert from './staking/StakingAlert';
import StakingForm from './staking/StakingForm';
import StakingStats from './staking/StakingStats';
import AirdropWithdrawal from './staking/AirdropWithdrawal';

const STAKING_UNLOCK_DATE = new Date('2025-08-25T00:00:00Z');

interface StakingCardProps {
  userBalance: number;
  hasAirdrop?: boolean;
  hasPremiumPlan?: boolean;
  totalStaked?: number;
  totalEarned?: number;
  userId?: string;
  updateUser: (user: any) => void;
}

const StakingCard: React.FC<StakingCardProps> = ({
  userBalance,
  hasAirdrop = false,
  hasPremiumPlan = false,
  totalStaked = 0,
  totalEarned = 0,
  userId,
  updateUser
}) => {
  const { toast } = useToast();
  const [withdrawableAmount, setWithdrawableAmount] = useState(0);
  const [withdrawableUsdValue, setWithdrawableUsdValue] = useState(0);

  // Use the staking data hook
  const {
    stakingAmount,
    txId,
    setTxId,
    isSubmitting,
    handleStakeAmountChange,
    handleSubmitStaking
  } = useStakingData(userId, updateUser);

  // Determine if user has staked or has a premium plan
  const hasStaked = totalStaked > 0;
  
  // Update canWithdrawAirdrop to account for staking status
  const canWithdrawAirdrop = hasAirdrop && (hasPremiumPlan || hasStaked);
  
  // Update withdrawable amount and USD value when canWithdrawAirdrop or userBalance changes
  useEffect(() => {
    const amount = canWithdrawAirdrop ? userBalance * 0.5 : 0;
    setWithdrawableAmount(amount);
    setWithdrawableUsdValue(amount * DMI_COIN_VALUE);
  }, [canWithdrawAirdrop, userBalance]);

  const now = new Date();
  const daysUntilUnlock = Math.ceil((STAKING_UNLOCK_DATE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isStakingLocked = now < STAKING_UNLOCK_DATE;

  const handleWithdrawAirdrop = () => {
    toast({
      title: "Withdrawal initiated",
      description: `Your withdrawal of ${withdrawableAmount.toLocaleString()} DMI coins is being processed`,
    });
  };

  const handleWithdrawStaking = () => {
    if (isStakingLocked) {
      toast({
        title: "Staking Locked",
        description: `Staked USDT is locked until August 25, 2025`,
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Withdrawal initiated",
      description: `Your withdrawal of ${totalStaked} USDT is being processed`,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="border-b border-gray-100 p-5">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center mr-4">
            <Coins className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">DMI Staking</h2>
            <p className="text-sm text-gray-500">Stake USDT and earn daily rewards</p>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        {/* Alert showing withdrawal eligibility */}
        <StakingAlert />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Staking Form */}
          <StakingForm 
            stakingAmount={stakingAmount}
            txId={txId}
            isSubmitting={isSubmitting}
            handleStakeAmountChange={handleStakeAmountChange}
            setTxId={setTxId}
            handleSubmitStaking={handleSubmitStaking}
            daysUntilUnlock={daysUntilUnlock}
            isStakingLocked={isStakingLocked}
          />
          
          <div>
            {/* Staking Stats */}
            <StakingStats 
              totalStaked={totalStaked}
              totalEarned={totalEarned}
              isStakingLocked={isStakingLocked}
              handleWithdrawStaking={handleWithdrawStaking}
            />
            
            {/* Airdrop Withdrawal */}
            <AirdropWithdrawal 
              canWithdrawAirdrop={canWithdrawAirdrop}
              withdrawableAmount={withdrawableAmount}
              withdrawableUsdValue={withdrawableUsdValue}
              handleWithdrawAirdrop={handleWithdrawAirdrop}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakingCard;
