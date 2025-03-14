
import React from 'react';
import { WithdrawalRequest } from '@/lib/withdrawalTypes';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { CheckCircle2, XCircle, AlertTriangle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PendingRequestsTableProps {
  filteredRequests: WithdrawalRequest[];
  onApprove: (request: WithdrawalRequest) => void;
  onReject: (request: WithdrawalRequest) => void;
  setSelectedRequest: (request: WithdrawalRequest | null) => void;
}

const PendingRequestsTable: React.FC<PendingRequestsTableProps> = ({ 
  filteredRequests,
  onApprove,
  onReject,
  setSelectedRequest
}) => {
  const { toast } = useToast();
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "USDT address has been copied to clipboard"
    });
  };

  if (filteredRequests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <p>No pending withdrawal requests found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableCaption>List of pending withdrawal requests.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="w-1/3">USDT Address</TableHead>
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
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono break-all">{request.usdtAddress}</span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(request.usdtAddress)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>{new Date(request.createdAt).toLocaleString()}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => onApprove(request)}
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
                  </Dialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PendingRequestsTable;
