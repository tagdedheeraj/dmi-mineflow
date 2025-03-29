
import { useState, useEffect, useCallback } from 'react';
import { getStakingHistory, saveStakingTransaction, StakingTransaction } from '@/lib/firestore/stakingService';
import { getUser } from '@/lib/firestore/userService';
import { useToast } from '@/hooks/use-toast';

export const useStakingData = (
  userId: string | undefined,
  updateUser: (user: any) => void
) => {
  const [stakingHistory, setStakingHistory] = useState<StakingTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stakingAmount, setStakingAmount] = useState<string>('250');
  const [txId, setTxId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Load staking history
  const loadStakingHistory = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const history = await getStakingHistory(userId);
      setStakingHistory(history);
    } catch (error) {
      console.error("Error loading staking history:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load initial data
  useEffect(() => {
    if (userId) {
      loadStakingHistory();
    }
  }, [userId, loadStakingHistory]);

  // Submit staking
  const handleSubmitStaking = useCallback(async () => {
    if (!userId || !txId.trim() || isSubmitting) {
      toast({
        title: "Error",
        description: "Please enter your transaction ID",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const numStakeAmount = parseFloat(stakingAmount);
      
      // Save staking transaction
      await saveStakingTransaction(userId, numStakeAmount, txId);
      
      // Refresh user data
      const latestUserData = await getUser(userId);
      if (latestUserData) {
        updateUser(latestUserData);
      }
      
      // Refresh staking history
      await loadStakingHistory();
      
      toast({
        title: "Staking submitted!",
        description: `Your staking request of $${stakingAmount} USDT is being processed`,
      });
      
      // Reset form
      setTxId('');
    } catch (error) {
      console.error("Error submitting staking:", error);
      toast({
        title: "Error",
        description: "Failed to submit staking transaction. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, txId, stakingAmount, isSubmitting, updateUser, loadStakingHistory, toast]);

  const handleStakeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseFloat(value);
    
    if (value === '') {
      setStakingAmount('');
    } else if (!isNaN(numValue) && numValue >= 250 && numValue <= 5000) {
      setStakingAmount(value);
    }
  };

  return {
    stakingHistory,
    isLoading,
    stakingAmount,
    txId,
    setTxId,
    isSubmitting,
    handleStakeAmountChange,
    handleSubmitStaking,
    loadStakingHistory
  };
};

export default useStakingData;
