
import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';
import { UserData } from './types/userManagement';

interface UserActionButtonsProps {
  user: UserData;
  onSuspend: (user: UserData) => void;
  onReactivate: (user: UserData) => void;
  onDelete: (user: UserData) => void;
  isActionLoading: boolean;
}

const UserActionButtons: React.FC<UserActionButtonsProps> = ({
  user,
  onSuspend,
  onReactivate,
  onDelete,
  isActionLoading
}) => {
  return (
    <div className="flex items-center gap-2">
      {user.suspended ? (
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 px-2 text-green-600 border-green-200 hover:bg-green-50"
          onClick={() => onReactivate(user)}
          disabled={isActionLoading}
        >
          Reactivate
        </Button>
      ) : (
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 px-2 text-amber-600 border-amber-200 hover:bg-amber-50"
          onClick={() => onSuspend(user)}
        >
          Suspend
        </Button>
      )}
      
      <Button 
        size="sm" 
        variant="outline" 
        className="h-8 w-8 p-0 text-red-600"
        onClick={() => onDelete(user)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default UserActionButtons;
