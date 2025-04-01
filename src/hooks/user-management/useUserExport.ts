
import { useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { UserData } from './useUsersFetching';

interface UseUserExportProps {
  users: UserData[];
}

export const useUserExport = ({ users }: UseUserExportProps) => {
  const { toast } = useToast();

  // Export all user emails to a CSV file
  const exportUserEmails = useCallback(async () => {
    try {
      toast({
        title: "Starting export...",
        description: "Fetching all user emails",
      });

      // Fetch all users from Firestore
      const usersCollection = collection(db, 'users');
      const querySnapshot = await getDocs(usersCollection);
      
      if (querySnapshot.empty) {
        toast({
          title: "No users found",
          description: "There are no users to export",
          variant: "destructive",
        });
        return;
      }
      
      // Extract emails from the user data
      const emails = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return data.email || 'No email';
        })
        .filter(email => email !== 'No email' && email !== '');
      
      // Create CSV content
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Email Address\n" + 
        emails.join("\n");
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `user_emails_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export complete",
        description: `Successfully exported ${emails.length} user emails`,
      });
    } catch (error) {
      console.error("Error exporting user emails:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting user emails",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Export new user emails to a CSV file
  const exportNewUserEmails = useCallback(async () => {
    try {
      toast({
        title: "Starting export...",
        description: "Fetching new user emails",
      });

      // Only show new users that are displaying in the current view
      const newUsers = users.filter(user => user.isNew);
      
      if (newUsers.length === 0) {
        toast({
          title: "No new users found",
          description: "There are no new users to export",
          variant: "destructive",
        });
        return;
      }
      
      // Extract emails from the user data
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
  }, [toast, users]);

  return {
    exportUserEmails,
    exportNewUserEmails
  };
};
