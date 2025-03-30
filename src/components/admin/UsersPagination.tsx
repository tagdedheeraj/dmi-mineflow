
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

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
    <div className="flex flex-col items-center justify-between mt-4 gap-2">
      <div className="text-sm text-gray-500 w-full text-center sm:text-left">
        Showing page {currentPage} of {totalPages || 1}
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={onPrevPage} 
              className={isFirstPage || isLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {/* Show page numbers for small number of pages */}
          {totalPages <= 5 ? (
            [...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink 
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))
          ) : (
            // Show ellipsis for larger number of pages
            <>
              <PaginationItem>
                <PaginationLink isActive={currentPage === 1}>
                  1
                </PaginationLink>
              </PaginationItem>
              
              {currentPage > 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
              {currentPage > 2 && (
                <PaginationItem>
                  <PaginationLink>
                    {currentPage - 1}
                  </PaginationLink>
                </PaginationItem>
              )}
              
              {currentPage !== 1 && currentPage !== totalPages && (
                <PaginationItem>
                  <PaginationLink isActive>
                    {currentPage}
                  </PaginationLink>
                </PaginationItem>
              )}
              
              {currentPage < totalPages - 1 && (
                <PaginationItem>
                  <PaginationLink>
                    {currentPage + 1}
                  </PaginationLink>
                </PaginationItem>
              )}
              
              {currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationLink isActive={currentPage === totalPages}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
          
          <PaginationItem>
            <PaginationNext 
              onClick={onNextPage}
              className={!hasMorePages || isLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default UsersPagination;
