
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type UserPlan = {
  planId: string;
  expiresAt: string;
  boostMultiplier: number;
};

type UserData = {
  id: string;
  fullName: string;
  email: string;
  balance: number;
  usdtEarnings: number;
  referralCount?: number;
  activePlans?: UserPlan[];
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Fetch all users
  const fetchAllUsers = async () => {
    setIsLoading(true);
    try {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      
      const usersData: UserData[] = [];
      
      for (const userDoc of userSnapshot.docs) {
        const userData = userDoc.data();
        
        // Fetch referral count
        let referralCount = 0;
        try {
          const referralsRef = collection(db, 'referrals');
          const referralsSnapshot = await getDocs(referralsRef);
          referralCount = referralsSnapshot.docs.filter(
            doc => doc.data().referrerId === userDoc.id && doc.data().level === 1
          ).length;
        } catch (err) {
          console.error("Error fetching referrals:", err);
        }
        
        // Fetch active plans
        let activePlans: UserPlan[] = [];
        try {
          const plansRef = collection(db, 'active_plans');
          const plansSnapshot = await getDocs(plansRef);
          const now = new Date();
          
          activePlans = plansSnapshot.docs
            .filter(doc => doc.data().userId === userDoc.id)
            .map(doc => {
              const plan = doc.data();
              return {
                planId: plan.planId,
                expiresAt: new Date(plan.expiresAt).toLocaleDateString(),
                boostMultiplier: plan.boostMultiplier
              };
            })
            .filter(plan => new Date(plan.expiresAt) > now);
        } catch (err) {
          console.error("Error fetching plans:", err);
        }
        
        usersData.push({
          id: userDoc.id,
          fullName: userData.fullName || 'Unknown',
          email: userData.email || 'Unknown',
          balance: userData.balance || 0,
          usdtEarnings: userData.usdtEarnings || 0,
          referralCount,
          activePlans: activePlans.length > 0 ? activePlans : undefined
        });
      }
      
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = users.filter(
        user => 
          user.fullName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Format plans for display
  const formatPlans = (plans?: UserPlan[]): string => {
    if (!plans || plans.length === 0) return "No active plans";
    return plans.map(p => `${p.planId} (${p.boostMultiplier}x, expires: ${p.expiresAt})`).join(", ");
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm mb-8">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Button 
            onClick={fetchAllUsers} 
            variant="outline"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-dmi"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>DMI Coins</TableHead>
                  <TableHead>USDT</TableHead>
                  <TableHead>Referrals</TableHead>
                  <TableHead>Active Plans</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.balance.toFixed(2)}</TableCell>
                    <TableCell>${user.usdtEarnings?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell>{user.referralCount || 0}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {formatPlans(user.activePlans)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserManagement;
