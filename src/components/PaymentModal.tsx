import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { miningPlans } from '@/data/miningPlans';
import { useAuth } from '@/contexts/AuthContext';
import { addUsdtTransaction } from '@/lib/firebase';

interface PaymentModalProps {
  planId: string;
  planName: string;
  planPrice: number;
  onClose: () => void;
  onComplete: (transactionId: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  planId, 
  planName, 
  planPrice, 
  onClose, 
  onComplete 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handlePaymentSuccess = async (transactionId: string) => {
    try {
      // Find the plan details
      const plan = miningPlans.find(p => p.id === planId);
      if (!plan) throw new Error('Plan not found');
      
      // Add initial daily earnings to user's USDT balance
      await addUsdtTransaction(
        user!.id,
        plan.dailyEarnings,
        'deposit',
        `Initial earnings from ${plan.name}`,
        Date.now()
      );
      
      // Call the original onComplete handler
      onComplete(transactionId);
      
      toast({
        title: "Plan Activated!",
        description: `You will receive ${plan.dailyEarnings} USDT daily for the next ${plan.duration} days.`,
      });
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Purchase</DialogTitle>
          <DialogDescription>
            Are you sure you want to purchase the {planName} for ${planPrice}?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right text-sm font-medium text-gray-900">
              Plan
            </label>
            <div className="col-span-3">
              <input
                type="text"
                id="plan-name"
                value={planName}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
                disabled
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="username" className="text-right text-sm font-medium text-gray-900">
              Price
            </label>
            <div className="col-span-3">
              <input
                type="text"
                id="plan-price"
                value={`$${planPrice}`}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
                disabled
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={() => handlePaymentSuccess('fake-transaction-id')}>
            Confirm Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
