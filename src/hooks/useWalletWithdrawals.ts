
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { WithdrawalRequest } from '@/lib/withdrawalTypes';
import { useToast } from '@/hooks/use-toast';
import { getUserWithdrawalRequests, createWithdrawalRequest } from '@/lib/withdrawals';
import { User } from '@/lib/storage/types';

export function useWalletWithdrawals(user: User | null) {
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(0);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadWithdrawalRequests();
    }
  }, [user, location.pathname]);

  const loadWithdrawalRequests = async () => {
    if (!user) return;
    
    try {
      const requests = await getUserWithdrawalRequests(user.id);
      setWithdrawalRequests(requests);
    } catch (error) {
      console.error("Failed to load withdrawal requests:", error);
    }
  };

  const handleWithdraw = (usdtEarnings: number, usdtAddress?: string) => {
    if (!usdtAddress) {
      return { showAddressForm: true };
    }

    if (usdtEarnings < 50) {
      toast({
        title: "Minimum Withdrawal",
        description: "Minimum withdrawal amount is $50 USDT",
        variant: "destructive",
      });
      return { showAddressForm: false };
    }

    // Show withdrawal amount selection modal
    setIsWithdrawalModalOpen(true);
    setWithdrawalAmount(usdtEarnings);
    return { showAddressForm: false };
  };

  const submitWithdrawalRequest = async (
    user: User,
    withdrawalAmount: number,
    onSuccess: (updatedUser: User) => void
  ) => {
    if (!user) return;

    if (withdrawalAmount <= 0 || withdrawalAmount > (user.usdtEarnings || 0)) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create withdrawal request
      const requestId = await createWithdrawalRequest(
        user.id,
        user.fullName,
        user.email,
        withdrawalAmount,
        user.usdtAddress || ''
      );

      if (requestId) {
        // Deduct from user's USDT earnings
        const updatedUser = { 
          ...user, 
          usdtEarnings: user.usdtEarnings ? user.usdtEarnings - withdrawalAmount : 0 
        };
        onSuccess(updatedUser);
        
        // Close modal and show success message
        setIsWithdrawalModalOpen(false);
        toast({
          title: "Withdrawal Requested",
          description: "Your withdrawal request has been submitted and will be processed shortly.",
        });
        
        // Reload withdrawal requests
        loadWithdrawalRequests();
      } else {
        throw new Error("Failed to create withdrawal request");
      }
    } catch (error) {
      console.error("Error creating withdrawal request:", error);
      toast({
        title: "Error",
        description: "Failed to submit withdrawal request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    withdrawalRequests,
    withdrawalAmount,
    setWithdrawalAmount,
    isWithdrawalModalOpen,
    setIsWithdrawalModalOpen,
    isLoading,
    handleWithdraw,
    submitWithdrawalRequest,
    loadWithdrawalRequests
  };
}
