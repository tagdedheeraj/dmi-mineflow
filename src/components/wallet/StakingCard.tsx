
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Coins, Wallet, ArrowUpRight, Copy, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'react-qr-code';

// Mock USDT BEP-20 address for demo purposes
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";

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

  // Calculate daily profit (1% of staked amount)
  const dailyProfit = parseFloat(stakeAmount) * 0.01;
  
  // Determine if user can withdraw airdrop coins (50% of coins)
  const canWithdrawAirdrop = hasAirdrop && (hasPremiumPlan || totalStaked >= 250);
  
  // Calculate withdrawable amount (50% for eligible users)
  const withdrawableAmount = canWithdrawAirdrop ? userBalance * 0.5 : 0;

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
    
    // Validate input
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
    
    // Simulate API call
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
          {/* Staking Form */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Stake USDT (BEP-20)</h3>
            <p className="text-sm text-gray-600 mb-4">Minimum $250 - Maximum $5,000</p>
            
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
                  <QRCode value={USDT_ADDRESS} size={150} />
                </div>
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
          
          {/* Staking Stats */}
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
              </div>
            </div>
            
            {/* Airdrop Withdrawal Option */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start mb-3">
                <Wallet className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium">DMI Airdrop Withdrawal</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {canWithdrawAirdrop 
                      ? "You are eligible to withdraw 50% of your DMI coins" 
                      : "Stake at least $250 or purchase a $500 plan to withdraw airdrop coins"}
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
                  Full withdrawals available after April 10, 2023
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
