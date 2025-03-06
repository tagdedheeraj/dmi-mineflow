
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, CheckCircle, AlertCircle, ArrowRight, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { setUsdtAddress } from '@/lib/storage';
import UsdtClaimCard from '@/components/UsdtClaimCard';

const Wallet: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateUser } = useAuth();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [usdtAddress, setUsdtAddressValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    
    // Initialize form with user's USDT address if available
    if (user.usdtAddress) {
      setUsdtAddressValue(user.usdtAddress);
    }
  }, [user, navigate]);
  
  const handleSaveAddress = async () => {
    if (!user) return;
    
    if (!usdtAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid USDT address.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const updatedUser = await setUsdtAddress(user.id, usdtAddress);
      
      if (updatedUser) {
        updateUser(updatedUser);
        
        toast({
          title: "Address Saved",
          description: "Your USDT address has been saved successfully."
        });
      }
    } catch (error) {
      console.error("Error saving USDT address:", error);
      toast({
        title: "Error",
        description: "An error occurred while saving your address. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleWithdraw = () => {
    if (!user) return;
    
    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive"
      });
      return;
    }
    
    if (!user.usdtAddress) {
      toast({
        title: "USDT Address Required",
        description: "Please set your USDT address before making a withdrawal.",
        variant: "destructive"
      });
      return;
    }
    
    if (user.usdtEarnings && amount > user.usdtEarnings) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough USDT for this withdrawal.",
        variant: "destructive"
      });
      return;
    }
    
    setIsWithdrawing(true);
    
    // Simulate withdrawal process
    setTimeout(() => {
      toast({
        title: "Withdrawal Requested",
        description: `Your withdrawal request for $${amount.toFixed(2)} has been submitted. It will be processed soon.`,
      });
      
      setWithdrawAmount('');
      setIsWithdrawing(false);
    }, 1500);
  };
  
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(usdtAddress);
    
    toast({
      title: "Copied",
      description: "Address copied to clipboard."
    });
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-fade-in">
      <Header />
      
      <main className="pt-24 px-4 max-w-screen-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Wallet</h1>
        
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white shadow-lg mb-6">
          <div className="flex justify-between">
            <div>
              <h2 className="text-lg font-medium text-white/80">DMI Balance</h2>
              <p className="text-3xl font-bold mt-1">{user.balance.toFixed(2)}</p>
            </div>
            <div>
              <h2 className="text-lg font-medium text-white/80">USDT Earnings</h2>
              <p className="text-3xl font-bold mt-1">${user.usdtEarnings?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => navigate('/plans')}
            >
              Get More DMI Coins & Boost Earnings
            </Button>
          </div>
        </div>
        
        {/* USDT Claim Card - only visible if user has active arbitrage plans */}
        <UsdtClaimCard />
        
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mt-6">
          <Tabs defaultValue="withdraw">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="withdraw" className="p-5">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="withdraw-amount">USDT Withdrawal Amount</Label>
                  <div className="flex mt-1.5">
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="rounded-r-none"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-l-none border-l-0"
                      onClick={() => user.usdtEarnings && setWithdrawAmount(user.usdtEarnings.toString())}
                    >
                      MAX
                    </Button>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg flex gap-3 items-start">
                  <div className="text-blue-600 mt-0.5">
                    <InfoIcon className="h-5 w-5" />
                  </div>
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">Withdrawal Information</p>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-blue-700/80">
                      <li>Minimum withdrawal: $10 USDT</li>
                      <li>Processing time: 24-72 hours</li>
                      <li>Ensure your USDT address is correct</li>
                    </ul>
                  </div>
                </div>
                
                {!user.usdtAddress && (
                  <div className="bg-yellow-50 p-3 rounded-lg flex gap-3 items-start">
                    <div className="text-yellow-600 mt-0.5">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div className="text-sm text-yellow-700">
                      <p>Please set your USDT address in the Settings tab before making a withdrawal.</p>
                    </div>
                  </div>
                )}
                
                <Button 
                  className="w-full flex items-center justify-center gap-2"
                  disabled={!user.usdtAddress || isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                  onClick={handleWithdraw}
                >
                  {isWithdrawing ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4" />
                      Withdraw USDT
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="p-5">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="usdt-address">USDT Address (BEP20)</Label>
                  <div className="flex mt-1.5">
                    <Input
                      id="usdt-address"
                      placeholder="Enter your USDT address"
                      value={usdtAddress}
                      onChange={(e) => setUsdtAddressValue(e.target.value)}
                      className="rounded-r-none"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-l-none border-l-0"
                      onClick={handleCopyAddress}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-amber-50 p-3 rounded-lg flex gap-3 items-start">
                  <div className="text-amber-600 mt-0.5">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div className="text-sm text-amber-700">
                    <p className="font-medium">Important</p>
                    <p className="mt-1">Please ensure you enter a valid USDT (BEP20) address. Incorrect addresses may result in permanent loss of funds.</p>
                  </div>
                </div>
                
                <Button 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleSaveAddress}
                  disabled={isSaving || !usdtAddress}
                >
                  {isSaving ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Save Address
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Wallet;

const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
};
