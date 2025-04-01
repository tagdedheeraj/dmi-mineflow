
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { saveAdminStakingTransaction } from '@/lib/firestore/stakingService';
import { StakingData } from '@/types/staking';
import { randomUUID } from '@/lib/utils';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Form schema for manual staking
export const manualStakingSchema = z.object({
  userEmail: z.string().email({ message: "Please enter a valid email address" }),
  amount: z.string().refine(val => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 250 && num <= 5000;
  }, { message: "Amount must be between 250 and 5000 USDT" }),
  transactionId: z.string().min(3, { message: "Transaction ID must be at least 3 characters" }),
});

export const useStakingManagement = () => {
  const [stakingRecords, setStakingRecords] = useState<StakingData[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<StakingData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Form setup for manual staking
  const form = useForm<z.infer<typeof manualStakingSchema>>({
    resolver: zodResolver(manualStakingSchema),
    defaultValues: {
      userEmail: "",
      amount: "250",
      transactionId: "",
    },
  });

  // Fetch all staking records with user information
  const fetchStakingRecords = async () => {
    setIsLoading(true);
    setActionSuccess(false);
    try {
      // Get all staking records
      const stakingRef = collection(db, 'staking_transactions');
      const stakingQuery = query(
        stakingRef,
        orderBy('createdAt', 'desc')
      );
      const stakingSnapshot = await getDocs(stakingQuery);
      
      const records: StakingData[] = [];
      
      // For each staking record, get the user details
      for (const stakingDoc of stakingSnapshot.docs) {
        const stakingData = stakingDoc.data();
        
        // Get user details
        const userQuery = query(collection(db, 'users'), where('id', '==', stakingData.userId));
        const userSnapshot = await getDocs(userQuery);
        
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          
          records.push({
            id: stakingDoc.id,
            userId: stakingData.userId,
            userName: userData.fullName || 'Unknown',
            userEmail: userData.email || 'No email',
            amount: stakingData.amount || 0,
            dailyEarnings: stakingData.amount * 0.01 || 0, // 1% daily earnings
            stakingDate: stakingData.createdAt?.toDate() || new Date(),
            lockedUntil: new Date(new Date().setDate(new Date().getDate() + 90)), // 90 days lock
            isActive: stakingData.status === 'active' || true,
            totalEarned: userData.stakingData?.totalEarned || 0,
            transactionId: stakingData.txId || ''
          });
        }
      }
      
      setStakingRecords(records);
      setFilteredRecords(records);
    } catch (error) {
      console.error("Error fetching staking records:", error);
      toast({
        title: "Error",
        description: "Failed to load staking records. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter records based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRecords(stakingRecords);
      return;
    }
    
    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = stakingRecords.filter(record => 
      record.userName.toLowerCase().includes(lowerCaseSearch) ||
      record.userEmail.toLowerCase().includes(lowerCaseSearch) ||
      record.transactionId.toLowerCase().includes(lowerCaseSearch)
    );
    
    setFilteredRecords(filtered);
  }, [searchTerm, stakingRecords]);

  // Calculate remaining locked days
  const calculateRemainingDays = (lockedUntil: Date): number => {
    const now = new Date();
    const diffTime = lockedUntil.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  // Handle manual staking form submission
  const onSubmitManualStaking = async (values: z.infer<typeof manualStakingSchema>) => {
    console.log("Manual staking form submitted with values:", values);
    setIsSubmitting(true);
    try {
      const amount = parseFloat(values.amount);
      const txId = values.transactionId || `admin-${randomUUID().slice(0, 8)}`;
      
      console.log("Calling saveAdminStakingTransaction with:", {
        userEmail: values.userEmail,
        amount,
        txId
      });
      
      const result = await saveAdminStakingTransaction(
        values.userEmail,
        amount,
        txId
      );
      
      console.log("saveAdminStakingTransaction result:", result);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        
        // Reset form and close dialog
        form.reset();
        setIsDialogOpen(false);
        
        // Refresh staking records
        await fetchStakingRecords();
        setActionSuccess(true);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating manual staking:", error);
      toast({
        title: "Error",
        description: "Failed to create staking transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchStakingRecords();
  }, []);

  return {
    stakingRecords,
    filteredRecords,
    searchTerm,
    setSearchTerm,
    isLoading,
    actionSuccess,
    isDialogOpen,
    setIsDialogOpen,
    isSubmitting,
    form,
    fetchStakingRecords,
    calculateRemainingDays,
    onSubmitManualStaking
  };
};
