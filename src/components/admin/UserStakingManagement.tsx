
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
import { AlertCircle, Search, RefreshCw, Coins } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { db } from '@/lib/firebase';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';

// Staking data type definition
interface StakingData {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  dailyEarnings: number;
  stakingDate: Date;
  lockedUntil: Date;
  isActive: boolean;
  totalEarned: number;
  transactionId: string;
}

const UserStakingManagement: React.FC = () => {
  const [stakingRecords, setStakingRecords] = useState<StakingData[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<StakingData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState(false);
  const { toast } = useToast();

  // Fetch all staking records with user information
  const fetchStakingRecords = async () => {
    setIsLoading(true);
    setActionSuccess(false);
    try {
      // Get all staking records
      const stakingRef = collection(db, 'staking_records');
      const stakingQuery = query(
        stakingRef,
        orderBy('stakingDate', 'desc')
      );
      const stakingSnapshot = await getDocs(stakingQuery);
      
      const records: StakingData[] = [];
      
      // For each staking record, get the user details
      for (const stakingDoc of stakingSnapshot.docs) {
        const stakingData = stakingDoc.data();
        
        // Get user details
        const userDoc = await getDocs(query(collection(db, 'users'), where('id', '==', stakingData.userId)));
        
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          
          records.push({
            id: stakingDoc.id,
            userId: stakingData.userId,
            userName: userData.full_name || 'Unknown',
            userEmail: userData.email || 'No email',
            amount: stakingData.amount || 0,
            dailyEarnings: stakingData.amount * 0.01 || 0, // 1% daily earnings
            stakingDate: stakingData.stakingDate.toDate(),
            lockedUntil: stakingData.lockedUntil?.toDate() || new Date('2025-08-25'),
            isActive: stakingData.isActive || true,
            totalEarned: stakingData.totalEarned || 0,
            transactionId: stakingData.transactionId || ''
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

  useEffect(() => {
    fetchStakingRecords();
  }, []);

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Calculate remaining locked days
  const calculateRemainingDays = (lockedUntil: Date): number => {
    const now = new Date();
    const diffTime = lockedUntil.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-semibold flex items-center">
          <Coins className="h-6 w-6 mr-2 text-purple-500" />
          User Staking Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {actionSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Action Completed Successfully</AlertTitle>
            <AlertDescription className="text-green-700">
              The staking data has been refreshed.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by user name, email or transaction ID..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-8"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchStakingRecords}
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
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No staking records found matching your search.' : 'No staking records found in the system.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount (USDT)</TableHead>
                  <TableHead>Daily Earnings</TableHead>
                  <TableHead>Staked On</TableHead>
                  <TableHead>Lock Status</TableHead>
                  <TableHead>Total Earned</TableHead>
                  <TableHead>Transaction ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => {
                  const lockedDaysRemaining = calculateRemainingDays(record.lockedUntil);
                  const isLocked = lockedDaysRemaining > 0;
                  
                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.userName}</div>
                          <div className="text-xs text-gray-500">{record.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">${record.amount.toFixed(2)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-green-600 font-medium">${record.dailyEarnings.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">1% daily</div>
                      </TableCell>
                      <TableCell>
                        {record.stakingDate.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {isLocked ? (
                          <div>
                            <Badge className="bg-blue-100 text-blue-600 border-blue-200">
                              Locked
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              {lockedDaysRemaining} days remaining
                            </div>
                          </div>
                        ) : (
                          <Badge className="bg-green-100 text-green-600 border-green-200">
                            Unlocked
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-green-600 font-medium">
                          ${record.totalEarned.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-gray-500 max-w-[120px] truncate" title={record.transactionId}>
                          {record.transactionId.substring(0, 12)}...
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserStakingManagement;
