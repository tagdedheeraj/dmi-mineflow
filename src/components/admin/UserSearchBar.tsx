
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from 'lucide-react';

interface UserSearchBarProps {
  searchTerm: string;
  isLoading: boolean;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRefresh: () => void;
}

const UserSearchBar: React.FC<UserSearchBarProps> = ({
  searchTerm,
  isLoading,
  onSearchChange,
  onRefresh,
}) => {
  return (
    <div className="flex items-center justify-between mb-4 gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={onSearchChange}
          className="w-full pl-10"
        />
      </div>
      <Button 
        onClick={onRefresh} 
        variant="outline"
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? "Loading..." : "Refresh"}
      </Button>
    </div>
  );
};

export default UserSearchBar;
