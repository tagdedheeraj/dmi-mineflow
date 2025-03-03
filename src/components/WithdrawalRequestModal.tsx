
import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';

interface WithdrawalRequestModalProps {
  usdtAddress: string;
  maxAmount: number;
  onSuccess: () => void;
}

const WithdrawalRequestModal: React.FC<WithdrawalRequestModalProps> = ({ 
  usdtAddress, 
  maxAmount,
  onSuccess 
}) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const numAmount = parseFloat(amount);
    
    // Validation
    if (!amount || isNaN(numAmount)) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (numAmount < 10) {
      setError('Minimum withdrawal amount is $10 USDT');
      return;
    }
    
    if (numAmount > maxAmount) {
      setError(`You can only withdraw up to $${maxAmount.toFixed(2)} USDT`);
      return;
    }
    
    if (!usdtAddress) {
      setError('Please set your USDT address in your profile first');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create withdrawal request
      await addDoc(collection(db, 'withdrawal_requests'), {
        userId: user?.id,
        userName: user?.fullName,
        amount: numAmount,
        usdtAddress,
        status: 'pending',
        createdAt: Date.now(),
      });
      
      // Close modal and show success message
      setIsOpen(false);
      toast({
        title: 'Request Submitted',
        description: 'Your withdrawal request has been submitted and is pending approval.',
      });
      
      // Call the success callback
      onSuccess();
      
    } catch (err) {
      console.error('Error submitting withdrawal request:', err);
      setError('Failed to submit withdrawal request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Withdraw USDT</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Withdraw USDT</DialogTitle>
          <DialogDescription>
            Enter the amount you want to withdraw. Minimum withdrawal is $10 USDT.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-md flex items-center text-red-800 text-sm">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="usdtAddress">USDT Address</Label>
            <Input
              id="usdtAddress"
              value={usdtAddress}
              disabled
              className="bg-gray-50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USDT)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="10"
              max={maxAmount}
              step="0.01"
              required
            />
            <p className="text-sm text-gray-500">
              Available balance: ${maxAmount.toFixed(2)} USDT
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalRequestModal;
