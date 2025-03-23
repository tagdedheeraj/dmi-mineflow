
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useUserManagement } from '@/hooks/useUserManagement';
import UserSearchBar from './UserSearchBar';
import UsersTable from './UsersTable';
import UsersPagination from './UsersPagination';
import UserDeleteDialog from './UserDeleteDialog';

const UserManagement: React.FC = () => {
  const {
    users,
    isLoading,
    searchTerm,
    currentPage,
    totalPages,
    isFirstPage,
    hasMorePages,
    userToDelete,
    isDeleting,
    handleSearch,
    refreshUsersList,
    nextPage,
    prevPage,
    setUserToDelete,
    handleDeleteUser,
  } = useUserManagement();

  return (
    <Card className="bg-white rounded-lg shadow-sm mb-8">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <UserSearchBar
          searchTerm={searchTerm}
          isLoading={isLoading}
          onSearchChange={handleSearch}
          onRefresh={refreshUsersList}
        />

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-dmi"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No users found
          </div>
        ) : (
          <>
            <UsersTable 
              users={users} 
              onDeleteUser={setUserToDelete} 
            />
            
            <UsersPagination
              currentPage={currentPage}
              totalPages={totalPages}
              isFirstPage={isFirstPage}
              isLoading={isLoading}
              hasMorePages={hasMorePages}
              onPrevPage={prevPage}
              onNextPage={nextPage}
            />
          </>
        )}
      </CardContent>
      
      <UserDeleteDialog
        userToDelete={userToDelete}
        isDeleting={isDeleting}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        onDelete={handleDeleteUser}
      />
    </Card>
  );
};

export default UserManagement;
