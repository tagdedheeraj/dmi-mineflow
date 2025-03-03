
import { supabase } from "./client";
import { getUser } from "./users";
import { updateUserBalance } from "./users";
import { MiningSession, ActivePlan } from "./types";

// Mining operations
export const getCurrentMining = async (): Promise<MiningSession | null> => {
  const user = await getUser();
  if (!user) return null;
  
  try {
    const { data, error } = await supabase
      .from('mining_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows returned'
      console.error('Error getting current mining session:', error);
      return null;
    }
    
    if (!data) return null;
    
    return {
      startTime: data.start_time,
      endTime: data.end_time,
      rate: data.rate,
      earned: data.earned,
      status: data.status as 'active' | 'completed' | 'pending'
    };
  } catch (err) {
    console.error('Error in getCurrentMining:', err);
    return null;
  }
};

export const saveCurrentMining = async (session: MiningSession): Promise<void> => {
  const user = await getUser();
  if (!user) return;
  
  try {
    // Check if there's already an active session
    const currentSession = await getCurrentMining();
    
    if (currentSession) {
      // Update existing session
      await supabase
        .from('mining_sessions')
        .update({
          start_time: session.startTime,
          end_time: session.endTime,
          rate: session.rate,
          earned: session.earned,
          status: session.status
        })
        .eq('user_id', user.id)
        .eq('status', 'active');
    } else {
      // Insert new session
      await supabase
        .from('mining_sessions')
        .insert({
          user_id: user.id,
          start_time: session.startTime,
          end_time: session.endTime,
          rate: session.rate,
          earned: session.earned,
          status: session.status
        });
    }
  } catch (err) {
    console.error('Error in saveCurrentMining:', err);
  }
};

export const clearCurrentMining = async (): Promise<void> => {
  const user = await getUser();
  if (!user) return;
  
  try {
    await supabase
      .from('mining_sessions')
      .update({ status: 'completed' })
      .eq('user_id', user.id)
      .eq('status', 'active');
  } catch (err) {
    console.error('Error in clearCurrentMining:', err);
  }
};

export const getMiningHistory = async (): Promise<MiningSession[]> => {
  const user = await getUser();
  if (!user) return [];
  
  try {
    const { data, error } = await supabase
      .from('mining_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error getting mining history:', error);
      return [];
    }
    
    return data.map(session => ({
      startTime: session.start_time,
      endTime: session.end_time,
      rate: session.rate,
      earned: session.earned,
      status: session.status as 'active' | 'completed' | 'pending'
    }));
  } catch (err) {
    console.error('Error in getMiningHistory:', err);
    return [];
  }
};

export const addToMiningHistory = async (session: MiningSession): Promise<void> => {
  const user = await getUser();
  if (!user) return;
  
  try {
    await supabase
      .from('mining_sessions')
      .insert({
        user_id: user.id,
        start_time: session.startTime,
        end_time: session.endTime,
        rate: session.rate,
        earned: session.earned,
        status: session.status
      });
  } catch (err) {
    console.error('Error in addToMiningHistory:', err);
  }
};

// Check if mining should be active
export const checkAndUpdateMining = async (): Promise<{ 
  updatedSession: MiningSession | null,
  earnedCoins: number 
}> => {
  const currentSession = await getCurrentMining();
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
    await clearCurrentMining();
    await addToMiningHistory(completedSession);
    
    // Update user balance
    await updateUserBalance(earnedCoins);
    
    return { updatedSession: completedSession, earnedCoins };
  }
  
  // Mining is still in progress
  return { updatedSession: currentSession, earnedCoins: 0 };
};
