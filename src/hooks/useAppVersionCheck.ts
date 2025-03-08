
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createNotification, NotificationType } from '@/lib/rewards/notificationService';

// Hours when notifications should be sent (8 AM, 2 PM, 8 PM)
const NOTIFICATION_HOURS = [8, 14, 20];

export const useAppVersionCheck = () => {
  const { user, appSettings } = useAuth();
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [lastVersion, setLastVersion] = useState<string | null>(null);
  const [lastNotificationTime, setLastNotificationTime] = useState<number | null>(null);

  // Check if the app version stored in localStorage matches the current version
  useEffect(() => {
    const checkAppVersion = () => {
      const storedVersion = localStorage.getItem('appVersion');
      
      if (storedVersion !== appSettings.version) {
        setNeedsUpdate(true);
        setLastVersion(storedVersion);
      } else {
        setNeedsUpdate(false);
      }
    };

    checkAppVersion();
  }, [appSettings.version]);

  // Schedule notifications to be sent at specific times
  useEffect(() => {
    if (!user || !needsUpdate) return;

    const scheduleNotifications = () => {
      const now = new Date();
      const currentHour = now.getHours();
      
      // Check if we're in one of the notification hours
      const shouldNotifyNow = NOTIFICATION_HOURS.includes(currentHour);
      
      // Check if we've already sent a notification in the current hour
      const lastNotificationHour = lastNotificationTime 
        ? new Date(lastNotificationTime).getHours() 
        : -1;
      
      if (shouldNotifyNow && currentHour !== lastNotificationHour) {
        sendUpdateNotification();
        setLastNotificationTime(Date.now());
      }
    };

    // Check immediately and then set up an interval
    scheduleNotifications();
    
    // Check every 15 minutes for notification scheduling
    const intervalId = setInterval(scheduleNotifications, 15 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [user, needsUpdate, lastNotificationTime, appSettings.version]);

  // Send a notification to the user about the update
  const sendUpdateNotification = async () => {
    if (!user) return;
    
    try {
      await createNotification(
        user.id,
        NotificationType.UPDATE_AVAILABLE,
        "App Update Available",
        `A new version (${appSettings.version}) of the DMI app is available. Please update now.`,
        undefined,
        { version: appSettings.version, updateUrl: appSettings.updateUrl }
      );
      console.log("Sent app update notification to user", user.id);
    } catch (error) {
      console.error("Error sending app update notification:", error);
    }
  };

  // Mark the app as updated by storing the current version in localStorage
  const markAsUpdated = () => {
    localStorage.setItem('appVersion', appSettings.version);
    setNeedsUpdate(false);
  };

  return { 
    needsUpdate, 
    currentVersion: appSettings.version, 
    lastVersion,
    updateUrl: appSettings.updateUrl,
    markAsUpdated
  };
};
