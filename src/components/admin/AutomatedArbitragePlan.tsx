
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { doc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { updateUsdtEarnings } from '@/lib/rewards/earningsUpdater';
import { User } from '@/lib/storage';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  userEmail: z.string().email({ message: "Please enter a valid email address" }),
  days: z.coerce.number().min(1, { message: "Duration must be at least 1 day" }),
  dailyAmount: z.coerce.number().min(0.01, { message: "Daily amount must be at least 0.01 USDT" })
});

type FormValues = z.infer<typeof formSchema>;

const AutomatedArbitragePlan: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [foundUser, setFoundUser] = useState<User | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userEmail: '',
      days: 28,
      dailyAmount: 4.76
    }
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      // First, find the user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where("email", "==", values.userEmail.trim()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast({
          title: "User not found",
          description: `No user found with email ${values.userEmail}`,
          variant: "destructive"
        });
        setFoundUser(null);
        setIsLoading(false);
        return;
      }
      
      // Get the user document
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as User;
      setFoundUser(userData);
      
      // Create an automated plan record
      const automatedPlansRef = collection(db, 'automated_arbitrage_plans');
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + values.days);
      
      const planData = {
        userId: userDoc.id,
        userEmail: values.userEmail,
        userName: userData.fullName || 'Unknown',
        dailyAmount: values.dailyAmount,
        totalDays: values.days,
        daysRemaining: values.days,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isActive: true,
        lastProcessedDate: null,
        createdAt: serverTimestamp(),
        createdBy: 'admin'
      };
      
      await addDoc(automatedPlansRef, planData);
      
      // Immediately add first day earnings
      await updateUsdtEarnings(
        userDoc.id,
        values.dailyAmount,
        'automated_arbitrage',
        true,
        'admin_activated_plan'
      );
      
      toast({
        title: "Plan Activated",
        description: `Automated arbitrage plan activated for ${userData.fullName || values.userEmail} with daily ${values.dailyAmount} USDT for ${values.days} days. First day payment has been processed.`,
      });
      
      // Reset form
      form.reset({
        userEmail: '',
        days: 28,
        dailyAmount: 4.76
      });
      setFoundUser(null);
      
    } catch (error) {
      console.error("Error activating automated plan:", error);
      toast({
        title: "Error",
        description: "Failed to activate automated arbitrage plan",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    const email = form.getValues('userEmail');
    if (!email) return;
    
    setIsLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where("email", "==", email.trim()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast({
          title: "User not found",
          description: `No user found with email ${email}`,
          variant: "destructive"
        });
        setFoundUser(null);
        return;
      }
      
      const userData = querySnapshot.docs[0].data() as User;
      setFoundUser(userData);
      toast({
        title: "User found",
        description: `Found user: ${userData.fullName || userData.email}`
      });
      
    } catch (error) {
      console.error("Error searching for user:", error);
      toast({
        title: "Error",
        description: "Failed to search for user",
        variant: "destructive"
      });
      setFoundUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Automated Arbitrage Plan Activation</CardTitle>
        <CardDescription>
          Activate an automated arbitrage plan for any user by email. This will automatically add daily USDT earnings to their account for the specified duration.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-end gap-4">
              <FormField
                control={form.control}
                name="userEmail"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>User Email</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSearch}
                disabled={isLoading || !form.getValues('userEmail')}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Verify User
              </Button>
            </div>
            
            {foundUser && (
              <div className="bg-green-50 p-3 rounded-md border border-green-200 text-green-700">
                <p className="font-semibold">User found:</p>
                <p>Name: {foundUser.fullName || 'Not provided'}</p>
                <p>Email: {foundUser.email}</p>
                <p>Current USDT Earnings: ${foundUser.usdtEarnings?.toFixed(2) || '0.00'}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Days)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dailyAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily USDT Amount</FormLabel>
                    <FormControl>
                      <Input type="number" min="0.01" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !foundUser}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Activate Automated Arbitrage Plan
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AutomatedArbitragePlan;
