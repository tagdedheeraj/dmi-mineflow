
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

const PLATFORM_FEE_PERCENTAGE = 5;

interface WithdrawalModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  usdtAddress: string;
  usdtEarnings: number;
  onWithdraw: (amount: number) => Promise<void>;
  isLoading: boolean;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onOpenChange,
  usdtAddress,
  usdtEarnings,
  onWithdraw,
  isLoading
}) => {
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(0);
  const [platformFee, setPlatformFee] = useState<number>(0);
  const [netWithdrawalAmount, setNetWithdrawalAmount] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setWithdrawalAmount(usdtEarnings);
    }
  }, [isOpen, usdtEarnings]);

  useEffect(() => {
    const fee = (withdrawalAmount * PLATFORM_FEE_PERCENTAGE) / 100;
    const netAmount = withdrawalAmount - fee;
    setPlatformFee(fee);
    setNetWithdrawalAmount(netAmount);
  }, [withdrawalAmount]);

  const handleSubmit = () => {
    onWithdraw(withdrawalAmount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw USDT</DialogTitle>
          <DialogDescription>
            Enter the amount you want to withdraw. A 5% platform fee will be applied.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="withdrawal-amount">Withdrawal Amount (USDT)</Label>
            <Input
              id="withdrawal-amount"
              type="number"
              value={withdrawalAmount}
              onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
              min={50}
              max={usdtEarnings}
              step={1}
            />
            <p className="text-xs text-gray-500">
              Available balance: {formatCurrency(usdtEarnings)}
            </p>
          </div>
          
          {withdrawalAmount > 0 && (
            <div className="space-y-1 bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between text-sm">
                <span>Withdrawal amount:</span>
                <span>{formatCurrency(withdrawalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-amber-600">
                <span>Platform fee ({PLATFORM_FEE_PERCENTAGE}%):</span>
                <span>-{formatCurrency(platformFee)}</span>
              </div>
              <div className="border-t border-gray-200 my-1 pt-1"></div>
              <div className="flex justify-between font-medium">
                <span>You will receive:</span>
                <span>{formatCurrency(netWithdrawalAmount)}</span>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Withdrawal Address</Label>
            <div className="p-3 bg-gray-50 rounded-md text-sm font-mono break-all">
              {usdtAddress}
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Important Notes:</p>
            <ul className="text-xs text-gray-600 list-disc pl-5 space-y-1">
              <li>Minimum withdrawal amount is $50 USDT</li>
              <li>A {PLATFORM_FEE_PERCENTAGE}% platform fee applies to all withdrawals</li>
              <li>Withdrawals are processed within 24-48 hours</li>
              <li>Make sure your withdrawal address is correct</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={withdrawalAmount < 50 || withdrawalAmount > usdtEarnings || isLoading}
          >
            {isLoading ? "Processing..." : "Confirm Withdrawal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalModal;
