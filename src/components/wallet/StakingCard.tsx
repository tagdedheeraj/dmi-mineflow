import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Coins, Wallet, ArrowUpRight, Copy, Check, AlertTriangle, Lock, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const USDT_ADDRESS = "0x9c94C54F5878D647CD91F13Fa89Db6E01A4bCFfB";
const STAKING_UNLOCK_DATE = new Date('2024-08-25T00:00:00Z');

interface StakingCardProps {
  userBalance: number;
  hasAirdrop?: boolean;
  hasPremiumPlan?: boolean;
  totalStaked?: number;
  totalEarned?: number;
}

const StakingCard: React.FC<StakingCardProps> = ({
  userBalance,
  hasAirdrop = false,
  hasPremiumPlan = false,
  totalStaked = 0,
  totalEarned = 0
}) => {
  const [stakeAmount, setStakeAmount] = useState<string>('250');
  const [txId, setTxId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dailyProfit = parseFloat(stakeAmount) * 0.01;
  
  const canWithdrawAirdrop = hasAirdrop && (hasPremiumPlan || totalStaked >= 250);
  
  const withdrawableAmount = canWithdrawAirdrop ? userBalance * 0.5 : 0;

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
        description: `Staked USDT is locked until August 25, 2024`,
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Withdrawal initiated",
      description: `Your withdrawal of ${formatCurrency(totalStaked)} USDT is being processed`,
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Stake USDT (BEP-20)</h3>
            <p className="text-sm text-gray-600 mb-4">Minimum $250 - Maximum $5,000</p>
            
            <Alert className="bg-blue-50 border-blue-200 text-blue-800 mb-4">
              <Lock className="h-4 w-4 text-blue-600 mr-2" />
              <AlertDescription className="text-blue-700 font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Staked USDT is locked until August 25, 2024
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
                  <span className="font-medium">{formatCurrency(totalStaked)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Earned:</span>
                  <span className="font-medium text-green-600">{formatCurrency(totalEarned)}</span>
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
                disabled={totalStaked <= 0}
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
                      ? "You are eligible to withdraw 50% of your DMI coins" 
                      : "Stake at least $250 or purchase a $500 plan to withdraw 50% airdrop coins"}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Available for withdrawal:</span>
                  <span className="font-medium">
                    {formatCurrency(withdrawableAmount)} DMI
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  50% withdrawals available after April 10, 2025
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
