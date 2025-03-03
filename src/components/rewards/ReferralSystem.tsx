
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Users, Copy, Gift } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateReferralCode, saveReferralCode, applyReferralCode, getReferredUsers } from '@/lib/firestore';

const ReferralSystem: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [referredUsers, setReferredUsers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Generate referral code if user doesn't have one
    if (user && !user.referralCode) {
      const code = generateReferralCode(user.id);
      setReferralCode(code);
      saveReferralCode(user.id, code).then(() => {
        updateUser({ ...user, referralCode: code });
      });
    } else if (user && user.referralCode) {
      setReferralCode(user.referralCode);
    }
    
    // Load referred users
    if (user) {
      getReferredUsers(user.id).then(users => {
        setReferredUsers(users);
      });
    }
  }, [user, updateUser]);
  
  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard.",
    });
  };
  
  const handleApplyCode = async () => {
    if (!inputCode) {
      toast({
        title: "Error",
        description: "Please enter a referral code.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await applyReferralCode(user?.id || '', inputCode);
      
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        
        // Update user object
        if (user) {
          updateUser({ ...user, appliedReferralCode: inputCode });
        }
        
        setInputCode('');
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply referral code. Please try again.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="p-4 border border-dmi/20 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-dmi">
            <Users className="h-5 w-5" />
            Refer & Earn
          </h2>
          <div className="text-xs bg-dmi/10 text-dmi font-medium px-3 py-1 rounded-full">
            Earn 100 DMI Coins
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Share your referral code with friends. When they apply your code, you'll both earn 100 DMI coins!
        </p>
        
        <div className="mb-6">
          <Label htmlFor="referral-code" className="text-sm font-medium mb-1.5 block">Your Referral Code</Label>
          <div className="flex items-center">
            <Input 
              id="referral-code"
              value={referralCode} 
              readOnly 
              className="bg-gray-50 border-gray-200"
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyReferralCode} 
              className="ml-2 flex-shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {!user?.appliedReferralCode && (
          <div className="mb-4">
            <Label htmlFor="apply-code" className="text-sm font-medium mb-1.5 block">Apply a Referral Code</Label>
            <div className="flex items-center gap-2">
              <Input
                id="apply-code"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Enter friend's code"
                className="flex-1"
              />
              <Button 
                onClick={handleApplyCode} 
                disabled={isSubmitting}
                className="flex-shrink-0"
              >
                Apply
              </Button>
            </div>
          </div>
        )}
        
        {user?.appliedReferralCode && (
          <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-md mb-4">
            <Gift className="h-4 w-4 text-green-500 inline mr-2" />
            You've already applied a referral code: <span className="font-medium">{user.appliedReferralCode}</span>
          </div>
        )}
        
        {referredUsers.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Your Referrals ({referredUsers.length})</h3>
            <div className="border rounded-md divide-y divide-gray-100 max-h-32 overflow-y-auto">
              {referredUsers.map(user => (
                <div key={user.id} className="p-2 text-xs flex justify-between items-center">
                  <span className="font-medium">{user.fullName}</span>
                  <span className="text-gray-500">
                    {user.timestamp && new Date(user.timestamp.toDate()).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReferralSystem;
