
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { 
  Shield, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  User,
  Calendar,
  FileText,
  MapPin,
  CheckSquare,
  Image,
  X
} from 'lucide-react';
import { useKYCManagement } from '@/hooks/admin/useKYCManagement';
import { KYCDocument } from '@/lib/firestore';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

const KYCStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-500">Approved</Badge>;
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>;
    case 'pending':
    default:
      return <Badge className="bg-yellow-500">Pending</Badge>;
  }
};

const KYCManagement: React.FC = () => {
  const {
    isLoading,
    kycRequests,
    selectedRequest,
    statusFilter,
    isKYCEnabled,
    setStatusFilter,
    setSelectedRequest,
    loadKYCRequests,
    handleApproveKYC,
    handleRejectKYC,
    viewKYCDetails,
    toggleKYCEnabled,
  } = useKYCManagement();
  
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  
  const handleRefresh = () => {
    loadKYCRequests();
  };
  
  const handleReject = () => {
    if (selectedRequest?.id) {
      handleRejectKYC(selectedRequest.id, rejectionReason)
        .then(success => {
          if (success) {
            setRejectionReason('');
            setShowRejectionDialog(false);
          }
        });
    }
  };
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    if (timestamp.toDate) {
      // Firestore timestamp
      return format(timestamp.toDate(), 'PPP p');
    } else if (typeof timestamp === 'string') {
      return format(new Date(timestamp), 'PPP');
    }
    
    return 'N/A';
  };
  
  return (
    <Card className="bg-white rounded-lg shadow-sm mb-8">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-2xl font-semibold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          KYC Verification Management
        </CardTitle>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="kyc-enabled"
              checked={isKYCEnabled}
              onCheckedChange={toggleKYCEnabled}
              disabled={isLoading}
            />
            <Label htmlFor="kyc-enabled">
              {isKYCEnabled ? 'KYC Required' : 'KYC Disabled'}
            </Label>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="pending" onValueChange={setStatusFilter} value={statusFilter}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending" className="relative">
              Pending
              {kycRequests.filter(req => req.status === 'pending').length > 0 && (
                <Badge
                  className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px] bg-yellow-500"
                >
                  {kycRequests.filter(req => req.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All Requests</TabsTrigger>
          </TabsList>
          
          <TabsContent value={statusFilter} className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-dmi"></div>
              </div>
            ) : kycRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
                <p>No {statusFilter !== 'all' ? statusFilter : ''} KYC requests found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left text-gray-600">Name</th>
                      <th className="px-4 py-2 text-left text-gray-600">Document</th>
                      <th className="px-4 py-2 text-left text-gray-600">Submitted</th>
                      <th className="px-4 py-2 text-left text-gray-600">Status</th>
                      <th className="px-4 py-2 text-right text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kycRequests.map((request) => (
                      <tr key={request.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3">{request.fullName}</td>
                        <td className="px-4 py-3">
                          {request.documentType === 'government_id' ? 'Government ID' : 'Passport'}
                        </td>
                        <td className="px-4 py-3">
                          {formatDate(request.submittedAt)}
                        </td>
                        <td className="px-4 py-3">
                          <KYCStatusBadge status={request.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => request.id && viewKYCDetails(request.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          
                          {request.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600"
                                onClick={() => request.id && handleApproveKYC(request.id)}
                                disabled={isLoading}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                                onClick={() => {
                                  if (request.id) {
                                    viewKYCDetails(request.id);
                                    setShowRejectionDialog(true);
                                  }
                                }}
                                disabled={isLoading}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* KYC Details Dialog */}
      <Dialog 
        open={!!selectedRequest} 
        onOpenChange={(open) => !open && setSelectedRequest(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  KYC Verification Details
                </DialogTitle>
                <DialogDescription>
                  Submitted on {formatDate(selectedRequest.submittedAt)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-medium flex items-center gap-1 mb-2">
                    <User className="h-4 w-4" />
                    Personal Information
                  </h4>
                  
                  <div className="space-y-3 bg-gray-50 p-3 rounded-md">
                    <div>
                      <Label className="text-xs text-gray-500">Full Name</Label>
                      <div className="font-medium">{selectedRequest.fullName}</div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-500">Document Type</Label>
                      <div className="font-medium">
                        {selectedRequest.documentType === 'government_id' ? 'Government ID' : 'Passport'}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-500">ID Number</Label>
                      <div className="font-medium">{selectedRequest.idNumber}</div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-500">Address</Label>
                      <div className="font-medium">{selectedRequest.address}</div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-500">Document Expiry</Label>
                      <div className="font-medium">{selectedRequest.documentExpiryDate}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium flex items-center gap-1 mb-2">
                    <Image className="h-4 w-4" />
                    Document Images
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-500">ID Front</Label>
                      <div className="mt-1 h-32 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        <img 
                          src={selectedRequest.frontImageUrl} 
                          alt="ID Front" 
                          className="max-h-full object-contain"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-500">ID Back</Label>
                      <div className="mt-1 h-32 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        <img 
                          src={selectedRequest.backImageUrl} 
                          alt="ID Back" 
                          className="max-h-full object-contain"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-500">Selfie</Label>
                      <div className="mt-1 h-32 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        <img 
                          src={selectedRequest.selfieImageUrl} 
                          alt="Selfie" 
                          className="max-h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h4 className="font-medium flex items-center gap-1 mb-2">
                  <Clock className="h-4 w-4" />
                  Verification Status
                </h4>
                
                <div className="flex items-center gap-2 mb-4">
                  <KYCStatusBadge status={selectedRequest.status} />
                  
                  {selectedRequest.reviewedAt && (
                    <span className="text-sm text-gray-500">
                      Reviewed on {formatDate(selectedRequest.reviewedAt)}
                    </span>
                  )}
                </div>
                
                {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                  <div className="bg-red-50 p-3 rounded-md">
                    <Label className="text-xs text-red-700">Rejection Reason</Label>
                    <div className="text-red-700">{selectedRequest.rejectionReason}</div>
                  </div>
                )}
              </div>
              
              <DialogFooter className="mt-4 gap-2">
                {selectedRequest.status === 'pending' && (
                  <>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setSelectedRequest(null)}
                    >
                      Cancel
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="destructive"
                      onClick={() => setShowRejectionDialog(true)}
                      disabled={isLoading}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    
                    <Button 
                      type="button"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => selectedRequest.id && handleApproveKYC(selectedRequest.id)}
                      disabled={isLoading}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </>
                )}
                
                {selectedRequest.status !== 'pending' && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setSelectedRequest(null)}
                  >
                    Close
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Rejection Reason Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this KYC verification request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <Label htmlFor="rejection-reason">Rejection Reason</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Enter the reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-1"
              rows={4}
            />
          </div>
          
          <DialogFooter className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowRejectionDialog(false)}
            >
              Cancel
            </Button>
            
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleReject}
              disabled={isLoading || !rejectionReason.trim()}
            >
              Reject Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default KYCManagement;
