
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wallet, Copy, Check, AlertTriangle, Lock, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

const USDT_ADDRESS = "0x9c94C54F5878D647CD91F13Fa89Db6E01A4bCFfB";

interface StakingFormProps {
  stakingAmount: string;
  txId: string;
  isSubmitting: boolean;
  handleStakeAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setTxId: (value: string) => void;
  handleSubmitStaking: () => void;
  daysUntilUnlock: number;
  isStakingLocked: boolean;
}

const StakingForm: React.FC<StakingFormProps> = ({
  stakingAmount,
  txId,
  isSubmitting,
  handleStakeAmountChange,
  setTxId,
  handleSubmitStaking,
  daysUntilUnlock,
  isStakingLocked
}) => {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  // Calculate daily profit
  const dailyProfit = parseFloat(stakingAmount) * 0.01;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(USDT_ADDRESS);
    setCopied(true);
    toast({
      title: "Address copied!",
      description: "USDT BEP-20 address copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
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
          value={stakingAmount}
          onChange={handleStakeAmountChange}
          min={250}
          max={5000}
          placeholder="Enter amount (min. $250)"
          className="w-full"
        />
        {parseFloat(stakingAmount) > 0 && (
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
        disabled={parseFloat(stakingAmount) < 250 || !txId.trim() || isSubmitting}
      >
        {isSubmitting ? "Processing..." : "Submit Staking"}
      </Button>
    </div>
  );
};

export default StakingForm;
