import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { WithdrawalRequest } from '@/lib/withdrawalTypes';
import { 
  getAllWithdrawalRequests, 
  getPendingWithdrawalRequests,
  approveWithdrawalRequest,
  rejectWithdrawalRequest
} from '@/lib/withdrawals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Filter, 
  LogOut, 
  RefreshCw,
  Search,
  ArrowLeft
} from 'lucide-react';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const Admin: React.FC = () => {
  const { user, isAdmin, signOut } = useAuth();
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/signin');
    }
  }, [user, isAdmin, isLoading, navigate]);

  // Load withdrawal requests
  const loadWithdrawalRequests = async () => {
    setIsLoading(true);
    try {
      const allRequests = await getAllWithdrawalRequests();
      const pending = await getPendingWithdrawalRequests();
      
      setWithdrawalRequests(allRequests);
      setPendingRequests(pending);
    } catch (error) {
      console.error("Error loading withdrawal requests:", error);
      toast({
        title: "Error",
        description: "Failed to load withdrawal requests.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawalRequests();
  }, []);

  const handleApproveRequest = async (request: WithdrawalRequest) => {
    if (!user || !request.id) return;
    
    try {
      const success = await approveWithdrawalRequest(request.id, user.id);
      
      if (success) {
        toast({
          title: "Request Approved",
          description: `Withdrawal request for ${formatCurrency(request.amount)} has been approved.`,
        });
        loadWithdrawalRequests(); // Refresh the list after approval
      } else {
        throw new Error("Failed to approve request.");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      toast({
        title: "Error",
        description: "Failed to approve withdrawal request.",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async () => {
    if (!user || !selectedRequest || !selectedRequest.id || !rejectionReason) return;
    
    try {
      const success = await rejectWithdrawalRequest(
        selectedRequest.id, 
        user.id, 
        rejectionReason
      );
      
      if (success) {
        toast({
          title: "Request Rejected",
          description: `Withdrawal request for ${formatCurrency(selectedRequest.amount)} has been rejected.`,
        });
        setRejectionReason("");
        setSelectedRequest(null);
        loadWithdrawalRequests(); // Refresh the list after rejection
      } else {
        throw new Error("Failed to reject request.");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description: "Failed to reject withdrawal request.",
        variant: "destructive",
      });
    }
  };

  // Filter requests based on search term
  const filteredRequests = (activeTab === "pending" ? pendingRequests : withdrawalRequests)
    .filter(request => 
      request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.usdtAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dmi"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/mining')}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Back to App</span>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">DMI Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="text-sm text-gray-600">
                  Logged in as <span className="font-semibold">{user.email}</span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Withdrawal Requests Management</h2>
          
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                type="text"
                placeholder="Search user or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={loadWithdrawalRequests}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="pending" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Pending
                {pendingRequests.length > 0 && (
                  <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {pendingRequests.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                All Requests
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p>No pending withdrawal requests found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableCaption>List of pending withdrawal requests.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>USDT Address</TableHead>
                        <TableHead>Requested Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{request.userName}</div>
                              <div className="text-sm text-gray-500">{request.userEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{formatCurrency(request.amount)}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            <span className="text-sm font-mono">{request.usdtAddress}</span>
                          </TableCell>
                          <TableCell>{new Date(request.createdAt).toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                onClick={() => handleApproveRequest(request)}
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => setSelectedRequest(request)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Reject Withdrawal Request</DialogTitle>
                                    <DialogDescription>
                                      Please provide a reason for rejecting this withdrawal request.
                                      The amount will be returned to the user's account.
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <div className="space-y-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <div className="font-medium">User:</div>
                                      <div className="col-span-3">{selectedRequest?.userName}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <div className="font-medium">Amount:</div>
                                      <div className="col-span-3 font-medium">
                                        {formatCurrency(selectedRequest?.amount || 0)}
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <label htmlFor="reason" className="font-medium">
                                        Rejection Reason:
                                      </label>
                                      <Input
                                        id="reason"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Enter reason for rejection"
                                      />
                                    </div>
                                  </div>
                                  
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button 
                                      variant="destructive" 
                                      onClick={handleRejectRequest}
                                      disabled={!rejectionReason}
                                    >
                                      Confirm Rejection
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="all">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p>No withdrawal requests found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableCaption>List of all withdrawal requests.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>USDT Address</TableHead>
                        <TableHead>Requested Date</TableHead>
                        <TableHead>Processed Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{request.userName}</div>
                              <div className="text-sm text-gray-500">{request.userEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{formatCurrency(request.amount)}</TableCell>
                          <TableCell>
                            {request.status === 'approved' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Approved
                              </span>
                            )}
                            {request.status === 'rejected' && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 cursor-pointer">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Rejected
                                  </span>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Rejection Details</DialogTitle>
                                  </DialogHeader>
                                  
                                  <div className="space-y-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <div className="font-medium">User:</div>
                                      <div className="col-span-3">{request.userName}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <div className="font-medium">Amount:</div>
                                      <div className="col-span-3 font-medium">
                                        {formatCurrency(request.amount || 0)}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <div className="font-medium">Reason:</div>
                                      <div className="col-span-3">
                                        {request.rejectionReason || "No reason provided"}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button>Close</Button>
                                    </DialogClose>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            )}
                            {request.status === 'pending' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            <span className="text-sm font-mono">{request.usdtAddress}</span>
                          </TableCell>
                          <TableCell>{new Date(request.createdAt).toLocaleString()}</TableCell>
                          <TableCell>
                            {request.processedAt ? 
                              new Date(request.processedAt).toLocaleString() : 
                              '-'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Admin;
