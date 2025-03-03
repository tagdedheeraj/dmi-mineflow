
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  serverTimestamp 
} from "firebase/firestore";
import { db, miningSessionsCollection } from "./config";
import { updateUserBalance } from "./users";
import type { MiningSession } from '../storage';

// Mining operations
export const getCurrentMining = async (userId: string): Promise<MiningSession | null> => {
  try {
    const q = query(
      miningSessionsCollection, 
      where("userId", "==", userId),
      where("status", "==", "active")
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data() as MiningSession;
      data.id = querySnapshot.docs[0].id;
      return data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching current mining:", error);
    return null;
  }
};

export const saveCurrentMining = async (userId: string, session: MiningSession): Promise<void> => {
  try {
    // Include user ID in the session data
    const sessionWithUserId = { ...session, userId };
    
    if (session.id) {
      // Update existing session
      const sessionRef = doc(db, 'mining_sessions', session.id);
      await updateDoc(sessionRef, {
        startTime: sessionWithUserId.startTime,
        endTime: sessionWithUserId.endTime,
        rate: sessionWithUserId.rate,
        earned: sessionWithUserId.earned,
        status: sessionWithUserId.status,
        userId: sessionWithUserId.userId
      });
    } else {
      // Create new session
      await addDoc(miningSessionsCollection, {
        startTime: sessionWithUserId.startTime,
        endTime: sessionWithUserId.endTime,
        rate: sessionWithUserId.rate,
        earned: sessionWithUserId.earned,
        status: sessionWithUserId.status,
        userId: sessionWithUserId.userId,
        createdAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Error saving current mining:", error);
  }
};

export const clearCurrentMining = async (sessionId: string): Promise<void> => {
  try {
    const sessionRef = doc(db, 'mining_sessions', sessionId);
    await updateDoc(sessionRef, {
      status: 'completed'
    });
  } catch (error) {
    console.error("Error clearing current mining:", error);
  }
};

export const getMiningHistory = async (userId: string): Promise<MiningSession[]> => {
  try {
    const q = query(
      miningSessionsCollection, 
      where("userId", "==", userId),
      where("status", "==", "completed")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as MiningSession;
      data.id = doc.id;
      return data;
    });
  } catch (error) {
    console.error("Error fetching mining history:", error);
    return [];
  }
};

export const addToMiningHistory = async (userId: string, session: MiningSession): Promise<void> => {
  try {
    await addDoc(miningSessionsCollection, {
      ...session,
      userId,
      status: 'completed',
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error adding to mining history:", error);
  }
};

// Check if mining should be active
export const checkAndUpdateMining = async (userId: string): Promise<{ 
  updatedSession: MiningSession | null,
  earnedCoins: number 
}> => {
  try {
    const currentSession = await getCurrentMining(userId);
    if (!currentSession || currentSession.status !== 'active') {
      return { updatedSession: null, earnedCoins: 0 };
    }

    const now = Date.now();
    
    // If mining period has completed
    if (now >= currentSession.endTime) {
      // Calculate exact earnings up to the end time
      const elapsedHours = (currentSession.endTime - currentSession.startTime) / (1000 * 60 * 60);
      const earnedCoins = Math.floor(elapsedHours * currentSession.rate);
      
      // Update session
      const completedSession: MiningSession = {
        ...currentSession,
        status: 'completed',
        earned: earnedCoins
      };
      
      if (currentSession.id) {
        // Clear current mining and add to history
        await clearCurrentMining(currentSession.id);
      }
      
      // Add to history
      await addToMiningHistory(userId, completedSession);
      
      // Update user balance
      await updateUserBalance(userId, earnedCoins);
      
      return { updatedSession: completedSession, earnedCoins };
    }
    
    // Mining is still in progress
    return { updatedSession: currentSession, earnedCoins: 0 };
  } catch (error) {
    console.error("Error checking and updating mining:", error);
    return { updatedSession: null, earnedCoins: 0 };
  }
};
