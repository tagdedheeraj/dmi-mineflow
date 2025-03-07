
import { 
  db, 
  addUsdtTransaction
} from '../firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { toast } from "@/hooks/use-toast";

// Notification types
export enum NotificationType {
  MINING_COMPLETED = 'mining_completed',
  REWARD_EARNED = 'reward_earned',
  PLAN_PURCHASED = 'plan_purchased',
  REFERRAL_SIGNUP = 'referral_signup',
  REFERRAL_COMMISSION = 'referral_commission',
  USDT_EARNINGS = 'usdt_earnings',
  TASK_COMPLETED = 'task_completed',
  WITHDRAWAL_REQUESTED = 'withdrawal_requested',
  WITHDRAWAL_APPROVED = 'withdrawal_approved',
  WITHDRAWAL_REJECTED = 'withdrawal_rejected'
}

// Notification interface
export interface Notification {
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  amount?: number;
  read: boolean;
  createdAt: number;
  data?: any;
}

/**
 * Create a new notification for a user
 * @param userId The user ID to create the notification for
 * @param type The type of notification
 * @param title The notification title
 * @param message The notification message
 * @param amount Optional amount associated with the notification
 * @param data Optional additional data
 * @returns The created notification
 */
export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  amount?: number,
  data?: any
): Promise<Notification | null> => {
  try {
    console.log(`Creating ${type} notification for user ${userId}`);
    
    const notificationsRef = collection(db, 'notifications');
    
    const notification: Notification = {
      userId,
      type,
      title,
      message,
      amount,
      read: false,
      createdAt: Date.now(),
      data
    };
    
    const docRef = await addDoc(notificationsRef, {
      ...notification,
      createdAt: serverTimestamp()
    });
    
    // Show toast notification for real-time feedback
    toast({
      title: title,
      description: message,
    });
    
    console.log(`Created notification ${docRef.id} for user ${userId}`);
    
    return {
      ...notification,
      id: docRef.id
    };
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

/**
 * Get user notifications sorted by creation date
 * @param userId The user ID to get notifications for
 * @param limit The maximum number of notifications to retrieve
 * @param unreadOnly Whether to get only unread notifications
 * @returns Array of notifications
 */
export const getUserNotifications = async (
  userId: string,
  notificationLimit: number = 20,
  unreadOnly: boolean = false
): Promise<Notification[]> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    
    let q = query(
      notificationsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(notificationLimit)
    );
    
    if (unreadOnly) {
      q = query(
        notificationsRef,
        where("userId", "==", userId),
        where("read", "==", false),
        orderBy("createdAt", "desc"),
        limit(notificationLimit)
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Notification
    }));
  } catch (error) {
    console.error("Error getting user notifications:", error);
    return [];
  }
};

/**
 * Get the count of unread notifications for a user
 * @param userId The user ID to get notifications for
 * @returns Number of unread notifications
 */
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      where("read", "==", false)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.size;
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    return 0;
  }
};

/**
 * Mark a notification as read
 * @param notificationId The notification ID to mark as read
 * @returns Whether the operation was successful
 */
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    
    await updateDoc(notificationRef, {
      read: true
    });
    
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
};

/**
 * Mark all notifications for a user as read
 * @param userId The user ID to mark all notifications as read
 * @returns Whether the operation was successful
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      where("read", "==", false)
    );
    
    const querySnapshot = await getDocs(q);
    
    const updatePromises = querySnapshot.docs.map(doc => 
      updateDoc(doc.ref, { read: true })
    );
    
    await Promise.all(updatePromises);
    
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
};

/**
 * Delete a notification
 * @param notificationId The notification ID to delete
 * @returns Whether the operation was successful
 */
export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    
    await updateDoc(notificationRef, {
      deleted: true
    });
    
    return true;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return false;
  }
};

// Notification creation helpers for specific events
export const notifyMiningCompleted = async (
  userId: string, 
  amount: number
): Promise<void> => {
  await createNotification(
    userId,
    NotificationType.MINING_COMPLETED,
    "Mining Completed",
    `You've earned ${amount} DMI coins from mining.`,
    amount
  );
};

export const notifyRewardEarned = async (
  userId: string, 
  amount: number, 
  source: string
): Promise<void> => {
  await createNotification(
    userId,
    NotificationType.REWARD_EARNED,
    "Reward Earned",
    `You've earned ${amount} DMI coins from ${source}.`,
    amount,
    { source }
  );
};

export const notifyPlanPurchased = async (
  userId: string, 
  planName: string, 
  cost: number
): Promise<void> => {
  await createNotification(
    userId,
    NotificationType.PLAN_PURCHASED,
    "Plan Purchased",
    `You've successfully purchased the ${planName} plan for $${cost}.`,
    cost,
    { planName }
  );
};

export const notifyReferralSignup = async (
  userId: string, 
  referredName: string, 
  bonus: number
): Promise<void> => {
  await createNotification(
    userId,
    NotificationType.REFERRAL_SIGNUP,
    "New Referral",
    `${referredName} signed up using your referral code. You earned ${bonus} DMI coins!`,
    bonus,
    { referredName }
  );
};

export const notifyReferralCommission = async (
  userId: string, 
  amount: number, 
  level: number
): Promise<void> => {
  await createNotification(
    userId,
    NotificationType.REFERRAL_COMMISSION,
    "Referral Commission",
    `You've earned ${amount} USDT commission from your level ${level} referral.`,
    amount,
    { level }
  );
};

export const notifyUsdtEarnings = async (
  userId: string, 
  amount: number, 
  source: string
): Promise<void> => {
  await createNotification(
    userId,
    NotificationType.USDT_EARNINGS,
    "USDT Earnings",
    `You've earned ${amount} USDT from ${source}.`,
    amount,
    { source }
  );
};

export const notifyTaskCompleted = async (
  userId: string, 
  taskName: string, 
  reward: number
): Promise<void> => {
  await createNotification(
    userId,
    NotificationType.TASK_COMPLETED,
    "Task Completed",
    `You've completed the "${taskName}" task and earned ${reward} DMI coins.`,
    reward,
    { taskName }
  );
};

export const notifyWithdrawalRequested = async (
  userId: string, 
  amount: number, 
  currency: string
): Promise<void> => {
  await createNotification(
    userId,
    NotificationType.WITHDRAWAL_REQUESTED,
    "Withdrawal Requested",
    `Your withdrawal request for ${amount} ${currency} has been submitted and is pending approval.`,
    amount,
    { currency }
  );
};

export const notifyWithdrawalApproved = async (
  userId: string, 
  amount: number, 
  currency: string
): Promise<void> => {
  await createNotification(
    userId,
    NotificationType.WITHDRAWAL_APPROVED,
    "Withdrawal Approved",
    `Your withdrawal request for ${amount} ${currency} has been approved.`,
    amount,
    { currency }
  );
};

export const notifyWithdrawalRejected = async (
  userId: string, 
  amount: number, 
  currency: string, 
  reason: string
): Promise<void> => {
  await createNotification(
    userId,
    NotificationType.WITHDRAWAL_REJECTED,
    "Withdrawal Rejected",
    `Your withdrawal request for ${amount} ${currency} has been rejected. Reason: ${reason}`,
    amount,
    { currency, reason }
  );
};
