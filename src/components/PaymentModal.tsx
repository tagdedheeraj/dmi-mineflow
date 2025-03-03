
import React, { useState, useEffect } from 'react';
import { QrCode, ArrowLeft, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDuration } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PaymentModalProps {
  planId: string;
  planName: string;
  planPrice: number;
  onClose: () => void;
  onComplete: (transactionId: string) => void;
}

const USDT_ADDRESS = "0x9c94C54F5878D647CD91F13Fa89Db6E01A4bCFfB";
const PAYMENT_TIMEOUT = 10 * 60; // 10 minutes in seconds

const PaymentModal: React.FC<PaymentModalProps> = ({
  planId,
  planName,
  planPrice,
  onClose,
  onComplete
}) => {
  const [transactionId, setTransactionId] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(PAYMENT_TIMEOUT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          toast({
            title: "Payment time expired",
            description: "The payment time has expired. Please try again.",
            variant: "destructive"
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, onClose, isSubmitted, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transactionId.trim()) {
      toast({
        title: "Transaction ID Required",
        description: "Please enter a valid transaction ID",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // In a real app, you would verify the transaction here
    // For now, we'll simulate a successful transaction
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      toast({
        title: "Transaction submitted",
        description: "Your payment is being processed. Your plan will activate shortly.",
      });

      // Wait 2 seconds, then close the modal and notify the parent
      setTimeout(() => {
        onComplete(transactionId);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        aria-hidden="true"
      ></div>
      <div 
        className="relative z-50 w-full max-w-md bg-white rounded-xl shadow-xl m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[80vh] overflow-y-auto p-6">
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-center">Payment Submitted</h3>
              <p className="text-center text-gray-600 mt-2">
                Your transaction is being processed. Your {planName} will activate shortly.
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-5">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 m-0 h-8" 
                  onClick={onClose}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <div className="flex items-center text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{formatDuration(timeRemaining)}</span>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2 text-center">
                Pay {planPrice} USDT (BEP20)
              </h3>
              <p className="text-sm text-center text-gray-600 mb-4">
                Send exactly {planPrice} USDT to the address below
              </p>

              <div className="flex justify-center mb-6">
                <div className="border-2 border-gray-200 rounded-lg p-2 overflow-hidden">
                  <img 
                    src="/lovable-uploads/8db582c6-1930-4f4e-9750-4f993735a428.png" 
                    alt="Payment QR Code"
                    className="w-48 h-48"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg mb-5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">USDT Address (BEP20)</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 p-0 text-blue-600"
                    onClick={() => {
                      navigator.clipboard.writeText(USDT_ADDRESS);
                      toast({
                        title: "Address copied",
                        description: "The USDT address has been copied to your clipboard",
                      });
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs break-all font-mono bg-white p-2 rounded border border-gray-200">
                  {USDT_ADDRESS}
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <Label htmlFor="transaction-id" className="mb-1 block">Enter Transaction ID</Label>
                  <Input
                    id="transaction-id"
                    placeholder="Paste your transaction ID here"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    After sending the payment, paste your transaction ID to activate your plan
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : 'Submit Payment'}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
