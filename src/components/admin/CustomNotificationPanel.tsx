
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { sendCustomNotificationToAllUsers } from '@/lib/rewards/notificationService';
import { useToast } from '@/hooks/use-toast';

const CustomNotificationPanel: React.FC = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Validation Error",
        description: "Both title and message are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const success = await sendCustomNotificationToAllUsers(title, message);
      
      if (success) {
        toast({
          title: "Notification Sent",
          description: "Your notification has been sent to all users.",
        });
        
        // Reset the form
        setTitle("");
        setMessage("");
      } else {
        throw new Error("Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Send Failed",
        description: "Failed to send notification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm mb-8">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Send Custom Notification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="notificationTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Notification Title
          </label>
          <Input
            id="notificationTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter notification title"
            className="w-full"
          />
        </div>
        
        <div>
          <label htmlFor="notificationMessage" className="block text-sm font-medium text-gray-700 mb-1">
            Notification Message
          </label>
          <Textarea
            id="notificationMessage"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter notification message"
            className="w-full min-h-[120px]"
            rows={4}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSendNotification} 
          disabled={isSending}
          className="w-full"
        >
          {isSending ? "Sending..." : "Send to All Users"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CustomNotificationPanel;
