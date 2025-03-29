
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { getDmiCoinValue, updateDmiCoinValue } from '@/lib/firestore/settingsService';
import { Coins } from 'lucide-react';

const DmiCoinValueManagement: React.FC = () => {
  const [coinValue, setCoinValue] = useState<number | string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCoinValue = async () => {
      setIsLoading(true);
      try {
        const value = await getDmiCoinValue();
        setCoinValue(value);
      } catch (error) {
        console.error("Error fetching DMI coin value:", error);
        toast({
          title: "Error",
          description: "Failed to fetch current DMI coin value.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoinValue();
  }, [toast]);

  const handleUpdateCoinValue = async () => {
    if (typeof coinValue !== 'number' && isNaN(Number(coinValue))) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid number for DMI coin value.",
        variant: "destructive",
      });
      return;
    }

    const newValue = typeof coinValue === 'number' ? coinValue : Number(coinValue);
    
    if (newValue <= 0) {
      toast({
        title: "Validation Error",
        description: "DMI coin value must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const success = await updateDmiCoinValue(newValue);
      
      if (success) {
        toast({
          title: "Value Updated",
          description: `DMI coin value has been updated to $${newValue.toFixed(4)}.`,
        });
      } else {
        throw new Error("Failed to update DMI coin value");
      }
    } catch (error) {
      console.error("Error updating DMI coin value:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update DMI coin value. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm mb-8">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          <CardTitle className="text-2xl font-semibold">DMI Coin Value Management</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <p className="text-sm text-gray-500">
          This setting controls the USD value of DMI coin used throughout the application.
          Changing this value affects all calculations, rewards, and displayed values.
        </p>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <div className="space-y-4">
            <div>
              <label htmlFor="coinValue" className="block text-sm font-medium text-gray-700 mb-1">
                DMI Coin Value (USD)
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <Input
                    id="coinValue"
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    value={coinValue}
                    onChange={(e) => setCoinValue(e.target.value)}
                    placeholder="0.0000"
                    className="pl-8"
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  onClick={handleUpdateCoinValue} 
                  disabled={isSaving || isLoading}
                  className="whitespace-nowrap"
                >
                  {isSaving ? "Updating..." : "Update Value"}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Current reference value: {isLoading ? "Loading..." : `$${typeof coinValue === 'number' ? coinValue.toFixed(4) : parseFloat(String(coinValue)).toFixed(4)}`}
              </p>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100">
              <p className="text-sm text-yellow-800 font-medium">Important Note</p>
              <p className="text-xs text-yellow-700 mt-1">
                Changing the DMI coin value affects all users' balances in USD terms. 
                Increasing the value will increase the USD worth of users' DMI holdings, 
                while decreasing it will reduce their holdings' USD value. Make changes carefully.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DmiCoinValueManagement;
