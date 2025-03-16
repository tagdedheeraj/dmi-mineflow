
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { getUserByEmail, updateUserBalance } from '@/lib/rewards/rewardsTracking';

const UserCoinsManagement: React.FC = () => {
  const [userEmail, setUserEmail] = useState("");
  const [amount, setAmount] = useState(0);
  const [foundUser, setFoundUser] = useState<{id: string; fullName: string; email: string; balance: number} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleFindUser = async () => {
    if (!userEmail.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a user email to search.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const user = await getUserByEmail(userEmail.trim().toLowerCase());
      
      if (user) {
        setFoundUser(user);
        toast({
          title: "User Found",
          description: `Found user: ${user.fullName} with ${user.balance} DMI coins.`,
        });
      } else {
        setFoundUser(null);
        toast({
          title: "User Not Found",
          description: "No user with this email was found.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error finding user:", error);
      toast({
        title: "Error",
        description: "Failed to find user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCoins = async () => {
    if (!foundUser || !amount) {
      toast({
        title: "Validation Error",
        description: "Please find a user and enter a valid amount to add.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const updatedUser = await updateUserBalance(foundUser.id, amount);
      
      if (updatedUser) {
        setFoundUser({
          ...foundUser,
          balance: updatedUser.balance
        });
        
        toast({
          title: "Coins Updated",
          description: `Added ${amount} DMI coins to ${foundUser.fullName}'s account.`,
        });
        
        // Reset amount after successful update
        setAmount(0);
      } else {
        throw new Error("Failed to update user balance");
      }
    } catch (error) {
      console.error("Error updating user balance:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update user's DMI coins. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm mb-8">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">User DMI Coins Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <div className="flex-grow">
            <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700 mb-1">
              User Email
            </label>
            <Input
              id="userEmail"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Enter user email"
              className="w-full"
            />
          </div>
          <div className="sm:mt-7">
            <Button 
              onClick={handleFindUser} 
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? "Searching..." : "Find User"}
            </Button>
          </div>
        </div>
        
        {foundUser && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium text-lg">User Details</h3>
            <div className="mt-2 space-y-2">
              <p><span className="font-medium">Name:</span> {foundUser.fullName}</p>
              <p><span className="font-medium">Email:</span> {foundUser.email}</p>
              <p><span className="font-medium">Current DMI Coins:</span> {foundUser.balance}</p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label htmlFor="coinAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount of DMI Coins to Add
              </label>
              <div className="flex space-x-2">
                <Input
                  id="coinAmount"
                  type="number"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="Enter amount"
                  className="w-full"
                />
                <Button 
                  onClick={handleUpdateCoins} 
                  disabled={isUpdating || !amount}
                  className="whitespace-nowrap"
                >
                  {isUpdating ? "Updating..." : "Add Coins"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserCoinsManagement;
