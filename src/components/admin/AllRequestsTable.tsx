
import React from 'react';
import { WithdrawalRequest } from '@/lib/withdrawalTypes';
import { formatCurrency } from '@/lib/utils';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Clock, AlertTriangle, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AllRequestsTableProps {
  filteredRequests: WithdrawalRequest[];
}

const AllRequestsTable: React.FC<AllRequestsTableProps> = ({ filteredRequests }) => {
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
        <p>No withdrawal requests found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableCaption>List of all withdrawal requests.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-1/3">USDT Address</TableHead>
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
                  </Dialog>
                )}
                {request.status === 'pending' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </span>
                )}
              </TableCell>
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
  );
};

export default AllRequestsTable;
