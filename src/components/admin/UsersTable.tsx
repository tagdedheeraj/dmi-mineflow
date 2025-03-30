
import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Import Badge component
import { Trash2 } from 'lucide-react';

type UserData = {
  id: string;
  fullName: string;
  email: string;
  balance: number;
  usdtEarnings: number;
  referralCount?: number;
  activePlans?: {
    planId: string;
    expiresAt: string;
    boostMultiplier: number;
  }[];
  isNew?: boolean; // Add isNew property
};

interface UsersTableProps {
  users: UserData[];
  onDeleteUser: (user: UserData) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, onDeleteUser }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>DMI Coins</TableHead>
            <TableHead>USDT</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {user.fullName}
                  {user.isNew && (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                      New
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.balance.toFixed(2)}</TableCell>
              <TableCell>${user.usdtEarnings?.toFixed(2) || "0.00"}</TableCell>
              <TableCell>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => onDeleteUser(user)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
