
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { User } from '@/lib/storage/types';

interface WithdrawalModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  withdrawalAmount: number;
  setWithdrawalAmount: (amount: number) => void;
  usdtEarnings: number;
  usdtAddress: string;
  isLoading: boolean;
  onConfirm: () => void;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onOpenChange,
  withdrawalAmount,
  setWithdrawalAmount,
  usdtEarnings,
  usdtAddress,
  isLoading,
  onConfirm
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw USDT</DialogTitle>
          <DialogDescription>
            Enter the amount you want to withdraw. The funds will be sent to your registered USDT address.
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
            onClick={onConfirm} 
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
