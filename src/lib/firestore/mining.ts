
import { 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  addDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { db, miningSessionsCollection } from "../firebase";
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
