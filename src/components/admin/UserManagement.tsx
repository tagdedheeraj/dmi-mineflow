
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
import { useToast } from '@/hooks/use-toast';

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
    exportUserEmails,
  } = useUserManagement();
  
  const { toast } = useToast();

  // Filter new users
  const newUsers = users.filter(user => user.isNew);
  
  // Debug information for new users
  useEffect(() => {
    console.log("Total users:", users.length);
    console.log("New users count:", newUsers.length);
    newUsers.forEach(user => {
      console.log(`New user: ${user.email}, created: ${user.createdAt ? new Date(user.createdAt).toISOString() : 'unknown'}`);
    });
  }, [users, newUsers]);

  // Function to export only new users' emails
  const exportNewUserEmails = async () => {
    try {
      if (newUsers.length === 0) {
        toast({
          title: "No new users",
          description: "There are no new users to export",
          variant: "destructive",
        });
        return;
      }
      
      // Extract emails from the new users data
      const emails = newUsers
        .map(user => user.email)
        .filter(email => email !== 'Unknown' && email !== '');
      
      // Create CSV content
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Email Address\n" + 
        emails.join("\n");
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `new_user_emails_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export complete",
        description: `Successfully exported ${emails.length} new user emails`,
      });
    } catch (error) {
      console.error("Error exporting new user emails:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting new user emails",
        variant: "destructive",
      });
    }
  };

  // Force initial refresh when component mounts
  useEffect(() => {
    refreshUsersList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          Export All Emails
        </Button>
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
              <h3 className="text-lg font-medium">Recently Created Accounts (Last 24h)</h3>
              <div className="flex gap-2">
                <Button 
                  onClick={refreshUsersList}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? "Loading..." : "Refresh"}
                </Button>
                <Button 
                  onClick={exportNewUserEmails}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={newUsers.length === 0}
                >
                  <Download className="h-4 w-4" />
                  Export New Users
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-dmi"></div>
              </div>
            ) : (
              <>
                {newUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No new users found
                  </div>
                ) : (
                  <UsersTable 
                    users={newUsers} 
                    onDeleteUser={setUserToDelete} 
                  />
                )}
              </>
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
