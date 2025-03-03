
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Check, X } from 'lucide-react';

// Define the structure for withdrawal requests
interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  usdtAddress: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}

const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    if (user?.email !== 'dmi@dminetwork.us') {
      navigate('/signin');
    }
  }, [user, navigate]);

  // Fetch withdrawal requests
  useEffect(() => {
    const fetchWithdrawalRequests = async () => {
      try {
        const q = query(
          collection(db, 'withdrawal_requests'),
          where('status', '==', 'pending')
        );
        
        const querySnapshot = await getDocs(q);
        const requests: WithdrawalRequest[] = [];
        
        querySnapshot.forEach((doc) => {
          requests.push({
            id: doc.id,
            ...doc.data()
          } as WithdrawalRequest);
        });
        
        // Sort by creation date, newest first
        requests.sort((a, b) => b.createdAt - a.createdAt);
        
        setWithdrawalRequests(requests);
      } catch (error) {
        console.error('Error fetching withdrawal requests:', error);
        toast({
          title: 'Error',
          description: 'Failed to load withdrawal requests',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawalRequests();
  }, []);

  const handleApprove = async (requestId: string) => {
    try {
      const requestRef = doc(db, 'withdrawal_requests', requestId);
      await updateDoc(requestRef, {
        status: 'approved',
        processedAt: Date.now()
      });

      // Update local state
      setWithdrawalRequests(prevRequests => 
        prevRequests.filter(request => request.id !== requestId)
      );

      toast({
        title: 'Success',
        description: 'Withdrawal request approved'
      });
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve withdrawal request',
        variant: 'destructive'
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const requestRef = doc(db, 'withdrawal_requests', requestId);
      await updateDoc(requestRef, {
        status: 'rejected',
        processedAt: Date.now()
      });

      // Update local state
      setWithdrawalRequests(prevRequests => 
        prevRequests.filter(request => request.id !== requestId)
      );

      toast({
        title: 'Success',
        description: 'Withdrawal request rejected'
      });
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject withdrawal request',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/mining')}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Withdrawal Requests</CardTitle>
            <CardDescription>
              Manage pending withdrawal requests from users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center">Loading requests...</div>
            ) : withdrawalRequests.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No pending withdrawal requests
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawalRequests.map((request) => (
                  <Card key={request.id} className="border border-gray-200">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{request.userName}</CardTitle>
                          <CardDescription className="text-sm truncate max-w-[300px]">
                            User ID: {request.userId}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Pending
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Amount</p>
                          <p className="font-medium">${request.amount.toFixed(2)} USDT</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">USDT Address</p>
                          <p className="font-medium truncate">{request.usdtAddress}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-medium">
                            {new Date(request.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                        onClick={() => handleReject(request.id)}
                      >
                        <X className="h-4 w-4 mr-2" /> Reject
                      </Button>
                      <Button
                        variant="outline"
                        size="sm" 
                        className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                        onClick={() => handleApprove(request.id)}
                      >
                        <Check className="h-4 w-4 mr-2" /> Approve
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
