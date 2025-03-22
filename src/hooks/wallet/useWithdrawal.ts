
import { useState, useCallback } from 'react';
import { getUser } from '@/lib/firestore';
import { createWithdrawalRequest } from '@/lib/withdrawals';
import { getUserWithdrawalRequests } from '@/lib/withdrawals';
import { useToast } from '@/hooks/use-toast';
import { WithdrawalRequest } from '@/lib/withdrawalTypes';

export const useWithdrawal = (
  userId: string | undefined,
  updateUser: (user: any) => void,
) => {
  const { toast } = useToast();
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load withdrawal requests
  const loadWithdrawalRequests = useCallback(async () => {
    if (!userId) return;
    
    try {
      const requests = await getUserWithdrawalRequests(userId);
      setWithdrawalRequests(requests);
    } catch (error) {
      console.error("Failed to load withdrawal requests:", error);
    }
  }, [userId]);

  // Handle withdrawal
  const handleWithdrawalRequest = useCallback(async (amount: number) => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const latestUser = await getUser(userId);
      if (!latestUser) {
        throw new Error("Could not get latest user data");
      }

      if (amount <= 0 || amount > latestUser.usdtEarnings) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid withdrawal amount.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const requestId = await createWithdrawalRequest(
        userId,
        latestUser.fullName,
        latestUser.email,
        amount,
        latestUser.usdtAddress || ''
      );

      if (requestId) {
        const updatedUser = { 
          ...latestUser, 
          usdtEarnings: latestUser.usdtEarnings ? latestUser.usdtEarnings - amount : 0 
        };
        updateUser(updatedUser);
        
        setIsWithdrawalModalOpen(false);
        toast({
          title: "Withdrawal Requested",
          description: "Your withdrawal request has been submitted and will be processed shortly.",
        });
        
        await loadWithdrawalRequests();
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
  }, [userId, toast, updateUser, loadWithdrawalRequests]);

  return {
    withdrawalRequests,
    isWithdrawalModalOpen,
    setIsWithdrawalModalOpen,
    isLoading,
    loadWithdrawalRequests,
    handleWithdrawalRequest
  };
};
