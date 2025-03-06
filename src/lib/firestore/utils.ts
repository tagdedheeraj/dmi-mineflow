
import { getCurrentMining, saveCurrentMining, clearCurrentMining, addToMiningHistory } from './mining';
import { updateUserBalance } from './user';
import type { MiningSession } from '../storage';

// Function to check and update mining sessions
export const checkAndUpdateMining = async (userId: string): Promise<{ 
  updatedSession: MiningSession | null,
  earnedCoins: number 
}> => {
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
    
    // Clear current mining and add to history
    await clearCurrentMining(currentSession.id!);
    await addToMiningHistory(userId, completedSession);
    
    // Update user balance
    await updateUserBalance(userId, earnedCoins);
    
    return { updatedSession: completedSession, earnedCoins };
  }
  
  // Mining is still in progress
  return { updatedSession: currentSession, earnedCoins: 0 };
};
