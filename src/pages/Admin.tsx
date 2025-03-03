
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  AlarmClock
} from 'lucide-react';
import { getWithdrawalRequests, updateWithdrawalRequestStatus, getUser } from '@/lib/storage';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Define withdrawal request interface
interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  processedAt?: number;
}

const Admin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    // Check if the user is admin
    if (!user || user.email !== 'admin@example.com') {
      navigate('/');
      return;
    }

    // Load withdrawal requests
    loadWithdrawalRequests();
  }, [user, navigate]);

  const loadWithdrawalRequests = () => {
    const requests = getWithdrawalRequests();
    setWithdrawalRequests(requests);
  };

  const handleApprove = (requestId: string) => {
    const updatedRequest = updateWithdrawalRequestStatus(requestId, 'approved');
    if (updatedRequest) {
      toast({
        title: "Request Approved",
        description: "The withdrawal request has been approved.",
      });
      loadWithdrawalRequests();
    }
  };

  const handleReject = (requestId: string) => {
    const updatedRequest = updateWithdrawalRequestStatus(requestId, 'rejected');
    if (updatedRequest) {
      toast({
        title: "Request Rejected",
        description: "The withdrawal request has been rejected.",
      });
      loadWithdrawalRequests();
    }
  };

  const filteredRequests = filter === 'all' 
    ? withdrawalRequests 
    : withdrawalRequests.filter(req => req.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-fade-in">
      <Header />
      
      <main className="pt-24 px-4 max-w-screen-lg mx-auto">
        <div className="flex items-center mb-6">
          <Shield className="h-8 w-8 text-purple-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
        
        <Alert className="mb-6">
          <AlertTitle className="text-amber-600 font-medium flex items-center">
            <AlarmClock className="h-4 w-4 mr-2" />
            Admin Access
          </AlertTitle>
          <AlertDescription>
            This page is only visible to admin users. Here you can manage user withdrawal requests and other admin tasks.
          </AlertDescription>
        </Alert>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="border-b border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center mr-4">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Withdrawal Requests</h2>
                  <p className="text-sm text-gray-500">Manage user withdrawals</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant={filter === 'all' ? 'default' : 'outline'} 
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button 
                  size="sm" 
                  variant={filter === 'pending' ? 'default' : 'outline'} 
                  onClick={() => setFilter('pending')}
                >
                  Pending
                </Button>
                <Button 
                  size="sm" 
                  variant={filter === 'approved' ? 'default' : 'outline'} 
                  onClick={() => setFilter('approved')}
                >
                  Approved
                </Button>
                <Button 
                  size="sm" 
                  variant={filter === 'rejected' ? 'default' : 'outline'} 
                  onClick={() => setFilter('rejected')}
                >
                  Rejected
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-5">
            {filteredRequests.length > 0 ? (
              <div className="space-y-4">
                {filteredRequests.map(request => {
                  const requestUser = getUser(request.userId);
                  return (
                    <div key={request.id} className="border border-gray-100 rounded-lg p-4">
                      <div className="md:flex md:justify-between">
                        <div className="mb-3 md:mb-0">
                          <div className="flex items-center mb-1">
                            <span className="font-medium mr-2">{requestUser?.name || 'Unknown User'}</span>
                            <span className="text-gray-500 text-sm">{requestUser?.email || ''}</span>
                          </div>
                          <div className="text-gray-700 mb-1">
                            <span className="font-medium">{formatCurrency(request.amount)}</span> withdrawal request
                          </div>
                          <div className="text-gray-500 text-sm mb-1">
                            Address: <span className="font-mono">{request.address}</span>
                          </div>
                          <div className="text-gray-500 text-sm">
                            Requested: {new Date(request.createdAt).toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="flex flex-col justify-center items-end">
                          <div className={`mb-2 text-sm font-medium px-3 py-1 rounded-full ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </div>
                          
                          {request.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-green-600 border-green-200 hover:bg-green-50 flex items-center"
                                onClick={() => handleApprove(request.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 border-red-200 hover:bg-red-50 flex items-center"
                                onClick={() => handleReject(request.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                          
                          {request.processedAt && (
                            <div className="text-gray-500 text-xs mt-1">
                              Processed: {new Date(request.processedAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No {filter !== 'all' ? filter : ''} withdrawal requests found</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
