
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from 'lucide-react';
import { UserData } from './types/userManagement';

interface UserStatusBadgeProps {
  user: UserData;
}

const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ user }) => {
  if (user.suspended) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        Suspended
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-green-50 text-green-600 flex items-center gap-1">
      <CheckCircle className="h-3 w-3" />
      Active
    </Badge>
  );
};

export default UserStatusBadge;
