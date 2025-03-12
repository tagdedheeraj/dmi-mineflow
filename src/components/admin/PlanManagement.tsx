
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
import { miningPlans, MiningPlan, reloadPlans } from '@/data/miningPlans';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { updateMiningPlans } from '@/lib/planManagement';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const PlanManagement: React.FC = () => {
  const [plans, setPlans] = useState<MiningPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<MiningPlan | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const { toast } = useToast();

  // Initialize plans from the data file or Firestore
  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setIsRefreshing(true);
    try {
      console.log("Loading plans in admin panel...");
      const loadedPlans = await reloadPlans();
      console.log("Admin panel loaded plans:", loadedPlans);
      
      // Log each plan's details to verify the data
      loadedPlans.forEach(plan => {
        console.log(`Admin panel loaded plan ${plan.id}: ${plan.name}, Daily Earnings: $${plan.dailyEarnings}`);
      });
      
      setPlans(loadedPlans);
      toast({
        title: "Plans Loaded",
        description: "Mining plans have been loaded successfully.",
      });
    } catch (error) {
      console.error("Error loading plans in admin panel:", error);
      toast({
        title: "Error",
        description: "Failed to load plans. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEditPlan = (plan: MiningPlan) => {
    setEditingPlan({...plan});
    setShowDialog(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingPlan) return;
    
    const { name, value } = e.target;
    
    // Handle numeric values
    if (['price', 'duration', 'dailyEarnings', 'miningBoost', 'totalEarnings'].includes(name)) {
      setEditingPlan({
        ...editingPlan,
        [name]: parseFloat(value) || 0
      });
    } else {
      setEditingPlan({
        ...editingPlan,
        [name]: value
      });
    }
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;
    
    setIsLoading(true);
    try {
      // Find the index of the plan we're editing
      const planIndex = plans.findIndex(p => p.id === editingPlan.id);
      if (planIndex === -1) return;
      
      // Create new plans array with updated plan
      const updatedPlans = [...plans];
      updatedPlans[planIndex] = editingPlan;
      
      // Save to Firestore
      await updateMiningPlans(updatedPlans);
      
      // Update local state
      setPlans(updatedPlans);
      setShowDialog(false);
      setSavedSuccess(true);
      
      toast({
        title: "Success",
        description: `${editingPlan.name} has been updated successfully.`,
      });
      
      // Reload plans from Firestore to ensure cache is updated
      const refreshedPlans = await reloadPlans();
      setPlans(refreshedPlans);
      
    } catch (error) {
      console.error("Error saving plan:", error);
      toast({
        title: "Error",
        description: "Failed to update the plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-semibold">Arbitrage Plan Management</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={loadPlans}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          {isRefreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh Plans
        </Button>
      </CardHeader>
      <CardContent>
        {savedSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Plans Updated Successfully</AlertTitle>
            <AlertDescription className="text-green-700">
              The plans have been updated in the database. Users will see the updated plans when they reload the app or visit the plans page.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Name</TableHead>
                <TableHead>Price ($)</TableHead>
                <TableHead>Duration (days)</TableHead>
                <TableHead>Daily Earnings ($)</TableHead>
                <TableHead>Mining Boost (x)</TableHead>
                <TableHead>Total Earnings ($)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>${plan.price}</TableCell>
                  <TableCell>{plan.duration}</TableCell>
                  <TableCell>${plan.dailyEarnings}</TableCell>
                  <TableCell>{plan.miningBoost}x</TableCell>
                  <TableCell>${plan.totalEarnings}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditPlan(plan)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Edit Plan Dialog */}
        {showDialog && editingPlan && (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit {editingPlan.name}</DialogTitle>
                <DialogDescription>
                  Make changes to the plan details below.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={editingPlan.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price ($)
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={editingPlan.price}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="duration" className="text-right">
                    Duration (days)
                  </Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    value={editingPlan.duration}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dailyEarnings" className="text-right">
                    Daily Earnings ($)
                  </Label>
                  <Input
                    id="dailyEarnings"
                    name="dailyEarnings"
                    type="number"
                    step="0.01"
                    value={editingPlan.dailyEarnings}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="miningBoost" className="text-right">
                    Mining Boost (x)
                  </Label>
                  <Input
                    id="miningBoost"
                    name="miningBoost"
                    type="number"
                    step="0.1"
                    value={editingPlan.miningBoost}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="totalEarnings" className="text-right">
                    Total Earnings ($)
                  </Label>
                  <Input
                    id="totalEarnings"
                    name="totalEarnings"
                    type="number"
                    value={editingPlan.totalEarnings}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="withdrawalTime" className="text-right">
                    Withdrawal Time
                  </Label>
                  <Input
                    id="withdrawalTime"
                    name="withdrawalTime"
                    value={editingPlan.withdrawalTime}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="limitedTo" className="text-right">
                    Limited To
                  </Label>
                  <Input
                    id="limitedTo"
                    name="limitedTo"
                    value={editingPlan.limitedTo || ''}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="Limited to first X users (optional)"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={handleSavePlan} 
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save changes'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanManagement;
