
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useUserManagement } from '@/hooks/useUserManagement';
import UserSearchBar from './UserSearchBar';
import UsersTable from './UsersTable';
import UsersPagination from './UsersPagination';
import UserDeleteDialog from './UserDeleteDialog';
import { Users, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    newUsersCount,
    viewingNewUsersOnly,
    handleSearch,
    refreshUsersList,
    nextPage,
    prevPage,
    setUserToDelete,
    handleDeleteUser,
    exportUserEmails,
    exportNewUserEmails,
    fetchNewUsersOnly,
    fetchAllUsers,
  } = useUserManagement();

  // Handle tab change
  const handleTabChange = (value: string) => {
    if (value === 'new-users') {
      fetchNewUsersOnly();
    } else {
      fetchAllUsers();
    }
  };

  // Get only new users for the "New Users" tab
  const newUsers = users.filter(user => user.isNew);

  return (
    <Card className="bg-white rounded-lg shadow-sm mb-8">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-2xl font-semibold flex items-center gap-2">
          <Users className="h-6 w-6" />
          User Management
        </CardTitle>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={exportUserEmails}
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <Download className="h-4 w-4" />
          Export Emails
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all-users" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="all-users">All Users</TabsTrigger>
            <TabsTrigger value="new-users" className="relative">
              New Users
              {newUsersCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]"
                >
                  {newUsersCount}
                </Badge>
              )}
            </TabsTrigger>
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
              <h3 className="text-lg font-medium flex items-center gap-2">
                Recently Created Accounts
                <Button 
                  onClick={fetchNewUsersOnly}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </h3>
              <Button 
                onClick={exportNewUserEmails}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={isLoading || newUsers.length === 0}
              >
                <Download className="h-4 w-4" />
                Export New Users
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-dmi"></div>
              </div>
            ) : viewingNewUsersOnly && users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No new users found
              </div>
            ) : (
              <UsersTable 
                users={viewingNewUsersOnly ? users : newUsers} 
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
