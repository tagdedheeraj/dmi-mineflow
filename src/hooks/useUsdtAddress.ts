
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { setUsdtAddress as setUserUsdtAddress } from '@/lib/firestore';
import { User } from '@/lib/storage/types';

export function useUsdtAddress(user: User | null, updateUser: (user: User) => void) {
  const [usdtAddress, setUsdtAddressState] = useState(user?.usdtAddress || '');
  const [isSettingAddress, setIsSettingAddress] = useState(false);
  const { toast } = useToast();

  const handleSetUsdtAddress = async () => {
    if (!user) return;
    
    if (usdtAddress.trim().length < 10) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid USDT BEP20 address",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedUser = await setUserUsdtAddress(user.id, usdtAddress);
      if (updatedUser) {
        updateUser(updatedUser);
        setIsSettingAddress(false);
        toast({
          title: "Address Saved",
          description: "Your USDT withdrawal address has been saved successfully.",
        });
      }
    } catch (error) {
      console.error("Error setting USDT address:", error);
      toast({
        title: "Error",
        description: "Failed to save USDT address. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    usdtAddress,
    setUsdtAddressState,
    isSettingAddress,
    setIsSettingAddress,
    handleSetUsdtAddress
  };
}
