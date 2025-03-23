
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface UsersPaginationProps {
  currentPage: number;
  totalPages: number;
  isFirstPage: boolean;
  isLoading: boolean;
  hasMorePages: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
}

const UsersPagination: React.FC<UsersPaginationProps> = ({
  currentPage,
  totalPages,
  isFirstPage,
  isLoading,
  hasMorePages,
  onPrevPage,
  onNextPage,
}) => {
  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-gray-500">
        Showing page {currentPage} of {totalPages || 1}
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onPrevPage}
          disabled={isFirstPage || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm">
          Page {currentPage}
        </span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onNextPage}
          disabled={!hasMorePages || isLoading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default UsersPagination;
