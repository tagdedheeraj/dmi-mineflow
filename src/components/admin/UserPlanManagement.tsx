
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
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Search, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { db } from '@/lib/firebase';
import { collection, query, getDocs, doc, updateDoc, where, orderBy, Timestamp } from 'firebase/firestore';

// User plan type definition
interface UserPlan {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planId: string;
  planName: string;
  purchasedAt: Date;
  expiresAt: Date;
  isActive: boolean;
  boostMultiplier: number;
  price: number;
}

const UserPlanManagement: React.FC = () => {
  const [userPlans, setUserPlans] = useState<UserPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<UserPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<UserPlan | null>(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);
  const { toast } = useToast();

  // Fetch all active plans with user information
  const fetchUserPlans = async () => {
    setIsLoading(true);
    setActionSuccess(false);
    try {
      // Get all membership cards
      const membershipCardsRef = collection(db, 'membership_cards');
      const membershipQuery = query(
        membershipCardsRef,
        orderBy('purchasedAt', 'desc')
      );
      const membershipSnapshot = await getDocs(membershipQuery);
      
      const plans: UserPlan[] = [];
      
      // For each membership, get the user details
      for (const membershipDoc of membershipSnapshot.docs) {
        const membershipData = membershipDoc.data();
        
        // Get user details
        const userRef = doc(db, 'users', membershipData.userId);
        const userDoc = await getDocs(query(collection(db, 'users'), where('id', '==', membershipData.userId)));
        
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          
          plans.push({
            id: membershipDoc.id,
            userId: membershipData.userId,
            userName: userData.full_name || 'Unknown',
            userEmail: userData.email || 'No email',
            planId: membershipData.planId,
            planName: membershipData.planId, // We'll update this with actual plan names if available
            purchasedAt: membershipData.purchasedAt.toDate(),
            expiresAt: membershipData.expiresAt.toDate(),
            isActive: membershipData.isActive,
            boostMultiplier: membershipData.boostMultiplier || 1,
            price: membershipData.price || 0
          });
        }
      }
      
      // Look up plan names from the plans collection
      const plansRef = collection(db, 'plans');
      const plansSnapshot = await getDocs(plansRef);
      const plansMap = new Map();
      
      plansSnapshot.docs.forEach(planDoc => {
        const planData = planDoc.data();
        plansMap.set(planDoc.id, planData.name);
      });
      
      // Update plan names
      const updatedPlans = plans.map(plan => ({
        ...plan,
        planName: plansMap.get(plan.planId) || plan.planId
      }));
      
      setUserPlans(updatedPlans);
      setFilteredPlans(updatedPlans);
    } catch (error) {
      console.error("Error fetching user plans:", error);
      toast({
        title: "Error",
        description: "Failed to load user plans. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPlans();
  }, []);

  // Filter plans based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPlans(userPlans);
      return;
    }
    
    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = userPlans.filter(plan => 
      plan.userName.toLowerCase().includes(lowerCaseSearch) ||
      plan.userEmail.toLowerCase().includes(lowerCaseSearch) ||
      plan.planName.toLowerCase().includes(lowerCaseSearch)
    );
    
    setFilteredPlans(filtered);
  }, [searchTerm, userPlans]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSuspendPlan = (plan: UserPlan) => {
    setSelectedPlan(plan);
    setShowSuspendDialog(true);
  };

  const confirmSuspendPlan = async () => {
    if (!selectedPlan) return;
    
    setIsProcessing(true);
    try {
      // Update the membership card to set isActive to false
      const membershipRef = doc(db, 'membership_cards', selectedPlan.id);
      await updateDoc(membershipRef, {
        isActive: false,
        suspendedAt: Timestamp.now(),
        suspendedBy: 'admin'
      });
      
      // Refresh the list
      await fetchUserPlans();
      
      setShowSuspendDialog(false);
      setActionSuccess(true);
      
      toast({
        title: "Plan Suspended",
        description: `${selectedPlan.planName} plan for ${selectedPlan.userName} has been suspended.`,
      });
      
    } catch (error) {
      console.error("Error suspending plan:", error);
      toast({
        title: "Error",
        description: "Failed to suspend the plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm mb-8">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">User Plan Management</CardTitle>
      </CardHeader>
      <CardContent>
        {actionSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Action Completed Successfully</AlertTitle>
            <AlertDescription className="text-green-700">
              The user plan has been updated. The changes will take effect immediately.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by user or plan name..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-8"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchUserPlans}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-dmi"></div>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No plans found matching your search.' : 'No user plans found in the system.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Purchased</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map((plan) => {
                  const isPlanExpired = new Date() > plan.expiresAt;
                  const daysLeft = Math.max(0, Math.floor((plan.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
                  
                  return (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{plan.userName}</div>
                          <div className="text-xs text-gray-500">{plan.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{plan.planName}</div>
                          <div className="text-xs text-gray-500">{plan.boostMultiplier}x boost</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {plan.purchasedAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{plan.expiresAt.toLocaleDateString()}</div>
                          {!isPlanExpired && (
                            <div className="text-xs text-gray-500">{daysLeft} days left</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isPlanExpired ? (
                          <Badge variant="outline" className="bg-gray-100 text-gray-600">Expired</Badge>
                        ) : plan.isActive ? (
                          <Badge className="bg-green-100 text-green-600 border-green-200">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Suspended</Badge>
                        )}
                      </TableCell>
                      <TableCell>${plan.price}</TableCell>
                      <TableCell>
                        {!isPlanExpired && plan.isActive && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleSuspendPlan(plan)}
                          >
                            Suspend
                          </Button>
                        )}
                        {!isPlanExpired && !plan.isActive && (
                          <span className="text-xs text-gray-500">Suspended</span>
                        )}
                        {isPlanExpired && (
                          <span className="text-xs text-gray-500">Expired</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      {/* Suspend Plan Dialog */}
      {showSuspendDialog && selectedPlan && (
        <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend User Plan</DialogTitle>
              <DialogDescription>
                Are you sure you want to suspend this plan? The user will no longer receive benefits from this plan.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <p><strong>User:</strong> {selectedPlan.userName}</p>
                <p><strong>Plan:</strong> {selectedPlan.planName}</p>
                <p><strong>Purchased:</strong> {selectedPlan.purchasedAt.toLocaleDateString()}</p>
                <p><strong>Expires:</strong> {selectedPlan.expiresAt.toLocaleDateString()}</p>
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                variant="destructive" 
                onClick={confirmSuspendPlan} 
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Suspend Plan'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default UserPlanManagement;
