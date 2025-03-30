
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useUserManagement } from '@/hooks/useUserManagement';
import UserSearchBar from './UserSearchBar';
import UsersTable from './UsersTable';
import UsersPagination from './UsersPagination';
import UserDeleteDialog from './UserDeleteDialog';
import { Users } from 'lucide-react';

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
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-2xl font-semibold flex items-center gap-2">
          <Users className="h-6 w-6" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all-users" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all-users">All Users</TabsTrigger>
            <TabsTrigger value="new-users">New Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all-users" className="space-y-4">
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
          </TabsContent>
          
          <TabsContent value="new-users" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Recently Created Accounts</h3>
              <button 
                onClick={refreshUsersList}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Refresh
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-dmi"></div>
              </div>
            ) : (
              <UsersTable 
                users={users.filter(user => user.isNew)} 
                onDeleteUser={setUserToDelete} 
              />
            )}
          </TabsContent>
        </Tabs>
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
