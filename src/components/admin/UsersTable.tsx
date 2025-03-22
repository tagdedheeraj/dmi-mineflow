
import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { UserData } from './types/userManagement';
import UserStatusBadge from './UserStatusBadge';
import UserActionButtons from './UserActionButtons';
import { formatPlans } from './utils/userManagementUtils';

interface UsersTableProps {
  users: UserData[];
  onSuspend: (user: UserData) => void;
  onReactivate: (user: UserData) => void;
  onDelete: (user: UserData) => void;
  isActionLoading: boolean;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  onSuspend,
  onReactivate,
  onDelete,
  isActionLoading
}) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No users found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>DMI Coins</TableHead>
          <TableHead>USDT</TableHead>
          <TableHead>Referrals</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Active Plans</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id} className={user.suspended ? "bg-gray-50" : ""}>
            <TableCell className="font-medium">{user.fullName}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.balance.toFixed(2)}</TableCell>
            <TableCell>${user.usdtEarnings?.toFixed(2) || "0.00"}</TableCell>
            <TableCell>{user.referralCount || 0}</TableCell>
            <TableCell>
              <UserStatusBadge user={user} />
            </TableCell>
            <TableCell className="max-w-md truncate">
              {formatPlans(user.activePlans)}
            </TableCell>
            <TableCell>
              <UserActionButtons 
                user={user}
                onSuspend={onSuspend}
                onReactivate={onReactivate}
                onDelete={onDelete}
                isActionLoading={isActionLoading}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UsersTable;
