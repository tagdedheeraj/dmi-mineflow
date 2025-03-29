
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Coins, Wallet, ArrowUpRight, Copy, Check, AlertTriangle, Lock, Calendar, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DMI_COIN_VALUE } from '@/data/miningPlans';
import { updateUserBalance, getUser } from '@/lib/firestore';

const USDT_ADDRESS = "0x9c94C54F5878D647CD91F13Fa89Db6E01A4bCFfB";
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
  const [stakeAmount, setStakeAmount] = useState<string>('250');
  const [txId, setTxId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localTotalStaked, setLocalTotalStaked] = useState(totalStaked);
  const [localTotalEarned, setLocalTotalEarned] = useState(totalEarned);
  const [hasStaked, setHasStaked] = useState(totalStaked > 0);
  const [withdrawableAmount, setWithdrawableAmount] = useState(0);
  const [withdrawableUsdValue, setWithdrawableUsdValue] = useState(0);

  // Update local state when props change
  useEffect(() => {
    setLocalTotalStaked(totalStaked);
    setLocalTotalEarned(totalEarned);
    setHasStaked(totalStaked > 0 || localTotalStaked > 0);
  }, [totalStaked, totalEarned, localTotalStaked]);

  // Calculate daily profit
  const dailyProfit = parseFloat(stakeAmount) * 0.01;
  
  // Update canWithdrawAirdrop to account for local staking status
  const canWithdrawAirdrop = hasAirdrop && (hasPremiumPlan || hasStaked || localTotalStaked >= 250);
  
  // Update withdrawable amount and USD value when canWithdrawAirdrop or userBalance changes
  useEffect(() => {
    const amount = canWithdrawAirdrop ? userBalance * 0.5 : 0;
    setWithdrawableAmount(amount);
    setWithdrawableUsdValue(amount * DMI_COIN_VALUE);
  }, [canWithdrawAirdrop, userBalance]);

  const now = new Date();
  const daysUntilUnlock = Math.ceil((STAKING_UNLOCK_DATE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isStakingLocked = now < STAKING_UNLOCK_DATE;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(USDT_ADDRESS);
    setCopied(true);
    toast({
      title: "Address copied!",
      description: "USDT BEP-20 address copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStakeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseFloat(value);
    
    if (value === '') {
      setStakeAmount('');
    } else if (!isNaN(numValue) && numValue >= 250 && numValue <= 5000) {
      setStakeAmount(value);
    }
  };

  const updateUserData = async () => {
    if (userId) {
      try {
        const latestUserData = await getUser(userId);
        if (latestUserData) {
          updateUser(latestUserData);
          console.log("Updated user data after staking:", latestUserData);
        }
      } catch (error) {
        console.error("Error updating user data after staking:", error);
      }
    }
  };

  const handleSubmitStaking = () => {
    if (!txId.trim()) {
      toast({
        title: "Error",
        description: "Please enter your transaction ID",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      // Update the staking stats immediately upon successful submission
      const numStakeAmount = parseFloat(stakeAmount);
      
      // Update local state to show changes immediately
      setLocalTotalStaked(prevStaked => prevStaked + numStakeAmount);
      setHasStaked(true);
      
      // Calculate daily earnings and add them to total earned
      const dailyEarning = numStakeAmount * 0.01;
      setLocalTotalEarned(prevEarned => prevEarned + dailyEarning);
      
      // Update withdrawable amount if user now qualifies for airdrop withdrawal
      if (!canWithdrawAirdrop && hasAirdrop && numStakeAmount >= 250) {
        const newWithdrawableAmount = userBalance * 0.5;
        setWithdrawableAmount(newWithdrawableAmount);
        setWithdrawableUsdValue(newWithdrawableAmount * DMI_COIN_VALUE);
      }
      
      // Update user data in Firestore
      updateUserData();
      
      toast({
        title: "Staking submitted!",
        description: `Your staking request of $${stakeAmount} USDT is being processed`,
      });
      setIsSubmitting(false);
      setTxId('');
    }, 1500);
  };

  const handleWithdrawAirdrop = () => {
    toast({
      title: "Withdrawal initiated",
      description: `Your withdrawal of ${formatCurrency(withdrawableAmount)} DMI coins is being processed`,
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
      description: `Your withdrawal of ${formatCurrency(localTotalStaked)} USDT is being processed`,
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
        {/* New Airdrop Withdrawal Eligibility Alert with Highlighted Text */}
        <Alert className="mb-5 bg-yellow-50 border-yellow-200">
          <Info className="h-4 w-4 text-yellow-600 mr-2" />
          <AlertDescription className="text-yellow-800">
            <p className="font-medium text-amber-700 text-base">Airdrop Withdrawal Eligibility:</p>
            <ul className="mt-1 text-sm list-disc pl-5 space-y-1">
              <li>Users who stake <span className="font-bold text-green-600">$250+</span> or purchase a <span className="font-bold text-green-600">$500 arbitrage plan</span> can withdraw <span className="font-bold text-green-600">50% of their airdrop coins</span>.</li>
              <li>Users without staking will <span className="font-bold text-red-600">not be able to withdraw</span> and will <span className="font-bold text-red-600">lose their airdrop coins</span> after April 10.</li>
              <li>Withdrawals will be available after <span className="font-bold text-amber-700">April 10, 2025</span>.</li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Stake USDT (BEP-20)</h3>
            <p className="text-sm text-gray-600 mb-4">Minimum $250 - Maximum $5,000</p>
            
            <Alert className="bg-blue-50 border-blue-200 text-blue-800 mb-4">
              <Lock className="h-4 w-4 text-blue-600 mr-2" />
              <AlertDescription className="text-blue-700 font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Staked USDT is locked until August 25, 2025
                {isStakingLocked && daysUntilUnlock > 0 && (
                  <span className="ml-1 text-xs bg-blue-100 px-2 py-0.5 rounded">
                    {daysUntilUnlock} days remaining
                  </span>
                )}
              </AlertDescription>
            </Alert>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Stake (USDT)</label>
              <Input
                type="number"
                value={stakeAmount}
                onChange={handleStakeAmountChange}
                min={250}
                max={5000}
                placeholder="Enter amount (min. $250)"
                className="w-full"
              />
              {parseFloat(stakeAmount) > 0 && (
                <div className="mt-2 text-sm text-green-600">
                  Daily earnings: {formatCurrency(dailyProfit)} (1%)
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">USDT Address (BEP-20)</label>
              <div className="flex">
                <div className="flex-1 bg-white border border-gray-300 rounded-l-md py-2 px-3 text-gray-700 text-sm truncate">
                  {USDT_ADDRESS}
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-l-none" 
                  onClick={copyToClipboard}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="mt-2 flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowQR(!showQR)}
                  className="text-xs"
                >
                  {showQR ? "Hide QR Code" : "Show QR Code"}
                </Button>
              </div>
              
              {showQR && (
                <div className="mt-3 flex justify-center bg-white p-3 rounded">
                  <img 
                    src="/lovable-uploads/909054cc-4fb6-4f8a-86d3-bf2e765f10ab.png" 
                    alt="USDT Address QR Code" 
                    className="h-36 w-36"
                  />
                </div>
              )}
              
              {showQR && (
                <Alert className="bg-red-50 border-red-200 text-red-800 mt-3">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700 font-medium">
                    WARNING: Submitting false transaction IDs will result in immediate account suspension without any prior warning.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
              <Input
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                placeholder="Enter your transaction ID"
                className="w-full"
              />
            </div>
            
            <Button 
              className="w-full"
              onClick={handleSubmitStaking}
              disabled={parseFloat(stakeAmount) < 250 || !txId.trim() || isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Submit Staking"}
            </Button>
          </div>
          
          <div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium mb-3">Your Staking Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Staked:</span>
                  <span className="font-medium">{formatCurrency(localTotalStaked)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Earned:</span>
                  <span className="font-medium text-green-600">{formatCurrency(localTotalEarned)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Rate:</span>
                  <span className="font-medium">1%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Lock Status:</span>
                  <span className={`font-medium flex items-center ${isStakingLocked ? 'text-red-500' : 'text-green-500'}`}>
                    {isStakingLocked ? (
                      <>
                        <Lock className="h-4 w-4 mr-1" /> Locked until Aug 25
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" /> Unlocked
                      </>
                    )}
                  </span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-4 flex items-center justify-center"
                onClick={handleWithdrawStaking}
                disabled={localTotalStaked <= 0}
              >
                Withdraw Staked USDT <ArrowUpRight className="ml-1 h-4 w-4" />
                {isStakingLocked && <Lock className="ml-1 h-3 w-3 text-red-500" />}
              </Button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start mb-3">
                <Wallet className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium">DMI Airdrop Withdrawal</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {canWithdrawAirdrop 
                      ? <span className="font-medium text-green-600">You are eligible to withdraw 50% of your DMI coins</span> 
                      : <span>Stake at least <span className="font-medium text-amber-600">$250</span> or purchase a <span className="font-medium text-amber-600">$500 plan</span> to withdraw 50% airdrop coins. <span className="font-medium text-red-600">Without staking, airdrop coins will be removed after April 10.</span></span>}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Available for withdrawal:</span>
                  <span className="font-medium text-green-600">
                    {withdrawableAmount.toLocaleString()} DMI
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>Estimated value:</span>
                  <span className="font-medium">{formatCurrency(withdrawableUsdValue)}</span>
                </div>
                <div className="text-xs text-gray-500">
                  50% withdrawals available after <span className="font-medium text-amber-600">April 10, 2025</span>
                </div>
              </div>
              
              <Button 
                variant="outline"
                className="w-full flex items-center justify-center"
                disabled={!canWithdrawAirdrop || withdrawableAmount <= 0}
                onClick={handleWithdrawAirdrop}
              >
                Withdraw Airdrop <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakingCard;
