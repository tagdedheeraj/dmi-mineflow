
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  fullName: string;
  email: string;
  balance: number;
  createdAt: number;
  usdtAddress?: string;
  usdtEarnings?: number;
  deviceId?: string;
  suspended?: boolean;
  suspendedReason?: string;
}

export interface MiningSession {
  startTime: number;
  endTime: number;
  rate: number;
  earned: number;
  status: 'active' | 'completed' | 'pending';
}

export interface ActivePlan {
  id: string;
  purchasedAt: string;
  expiresAt: string;
  boostMultiplier: number;
  duration: number;
}

export interface DeviceRegistration {
  deviceId: string;
  accountIds: string[];
  firstAccountCreatedAt: number;
}

// Generate a unique device ID
export const getDeviceId = async (): Promise<string> => {
  // Check localStorage first for compatibility with existing users
  let deviceId = localStorage.getItem('dmi_device_id');
  
  if (!deviceId) {
    // Generate a unique ID for this device
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('dmi_device_id', deviceId);
    
    // Add to Supabase device_registrations
    try {
      const { error } = await supabase
        .from('device_registrations')
        .insert({ 
          device_id: deviceId, 
          first_account_created_at: new Date().toISOString() 
        });
        
      if (error) console.error('Error registering device:', error);
    } catch (err) {
      console.error('Error creating device registration:', err);
    }
  }
  
  return deviceId;
};

// User operations
export const getUser = async (): Promise<User | null> => {
  // First check if we have a current Supabase session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) return null;
  
  // Get user data from users table
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();
    
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  
  if (!data) return null;
  
  // Format the user data to match our interface
  return {
    id: data.id,
    fullName: data.full_name,
    email: data.email,
    balance: data.balance,
    createdAt: new Date(data.created_at).getTime(),
    usdtAddress: data.usdt_address,
    usdtEarnings: data.usdt_earnings,
    deviceId: data.device_id,
    suspended: data.suspended,
    suspendedReason: data.suspended_reason
  };
};

export const saveUser = async (user: User): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        full_name: user.fullName,
        email: user.email,
        balance: user.balance,
        usdt_address: user.usdtAddress,
        usdt_earnings: user.usdtEarnings,
        device_id: user.deviceId,
        suspended: user.suspended,
        suspended_reason: user.suspendedReason
      });
      
    if (error) {
      console.error('Error saving user:', error);
    }
  } catch (err) {
    console.error('Error in saveUser:', err);
  }
};

export const updateUserBalance = async (amount: number): Promise<User | null> => {
  const user = await getUser();
  if (!user) return null;
  
  const newBalance = user.balance + amount;
  
  try {
    const { error } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', user.id);
      
    if (error) {
      console.error('Error updating balance:', error);
      return null;
    }
    
    user.balance = newBalance;
    return user;
  } catch (err) {
    console.error('Error in updateUserBalance:', err);
    return null;
  }
};

export const setUsdtAddress = async (address: string): Promise<User | null> => {
  const user = await getUser();
  if (!user) return null;
  
  try {
    const { error } = await supabase
      .from('users')
      .update({ usdt_address: address })
      .eq('id', user.id);
      
    if (error) {
      console.error('Error setting USDT address:', error);
      return null;
    }
    
    user.usdtAddress = address;
    return user;
  } catch (err) {
    console.error('Error in setUsdtAddress:', err);
    return null;
  }
};

export const updateUsdtEarnings = async (amount: number): Promise<User | null> => {
  const user = await getUser();
  if (!user) return null;
  
  const newEarnings = (user.usdtEarnings || 0) + amount;
  
  try {
    const { error } = await supabase
      .from('users')
      .update({ usdt_earnings: newEarnings })
      .eq('id', user.id);
      
    if (error) {
      console.error('Error updating USDT earnings:', error);
      return null;
    }
    
    // Also update the last earning update date
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const { data: existingUpdate } = await supabase
      .from('earning_updates')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (existingUpdate) {
      await supabase
        .from('earning_updates')
        .update({ last_update_date: today })
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('earning_updates')
        .insert({ user_id: user.id, last_update_date: today });
    }
    
    user.usdtEarnings = newEarnings;
    return user;
  } catch (err) {
    console.error('Error in updateUsdtEarnings:', err);
    return null;
  }
};

export const clearUser = async (): Promise<void> => {
  await supabase.auth.signOut();
};

// Device registration operations
export const registerAccountOnDevice = async (userId: string): Promise<{ 
  isMultipleAccount: boolean,
  within24Hours: boolean 
}> => {
  const deviceId = await getDeviceId();
  
  try {
    // Add the link between user and device
    await supabase
      .from('account_device_links')
      .insert({ user_id: userId, device_id: deviceId });
      
    // Get all accounts linked to this device
    const { data: links, error } = await supabase
      .from('account_device_links')
      .select('user_id')
      .eq('device_id', deviceId);
      
    if (error) {
      console.error('Error checking device links:', error);
      return { isMultipleAccount: false, within24Hours: false };
    }
    
    // Get device registration to check the first account creation time
    const { data: deviceData } = await supabase
      .from('device_registrations')
      .select('first_account_created_at')
      .eq('device_id', deviceId)
      .single();
      
    const isMultipleAccount = links.length > 1;
    const firstAccountTime = deviceData?.first_account_created_at 
      ? new Date(deviceData.first_account_created_at).getTime() 
      : Date.now();
      
    const timeSinceFirstAccount = Date.now() - firstAccountTime;
    const within24Hours = timeSinceFirstAccount < 24 * 60 * 60 * 1000;
    
    return {
      isMultipleAccount,
      within24Hours
    };
  } catch (err) {
    console.error('Error in registerAccountOnDevice:', err);
    return { isMultipleAccount: false, within24Hours: false };
  }
};

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

// Plans operations
export const getActivePlans = async (): Promise<ActivePlan[]> => {
  const user = await getUser();
  if (!user) return [];
  
  try {
    const { data, error } = await supabase
      .from('active_plans')
      .select('*')
      .eq('user_id', user.id)
      .gte('expires_at', new Date().toISOString());
      
    if (error) {
      console.error('Error getting active plans:', error);
      return [];
    }
    
    return data.map(plan => ({
      id: plan.plan_id,
      purchasedAt: plan.purchased_at,
      expiresAt: plan.expires_at,
      boostMultiplier: plan.boost_multiplier,
      duration: plan.duration
    }));
  } catch (err) {
    console.error('Error in getActivePlans:', err);
    return [];
  }
};

export const saveActivePlan = async (plan: ActivePlan): Promise<void> => {
  const user = await getUser();
  if (!user) return;
  
  try {
    await supabase
      .from('active_plans')
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        purchased_at: plan.purchasedAt,
        expires_at: plan.expiresAt,
        boost_multiplier: plan.boostMultiplier,
        duration: plan.duration
      });
  } catch (err) {
    console.error('Error in saveActivePlan:', err);
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

// Check last earnings update date for a user
export const getLastEarningsUpdateDate = async (): Promise<string | null> => {
  const user = await getUser();
  if (!user) return null;
  
  try {
    const { data, error } = await supabase
      .from('earning_updates')
      .select('last_update_date')
      .eq('user_id', user.id)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      console.error('Error getting last earnings update date:', error);
      return null;
    }
    
    return data?.last_update_date || null;
  } catch (err) {
    console.error('Error in getLastEarningsUpdateDate:', err);
    return null;
  }
};

// Set last earnings update date for a user
export const setLastEarningsUpdateDate = async (date: string): Promise<void> => {
  const user = await getUser();
  if (!user) return;
  
  try {
    const { data } = await supabase
      .from('earning_updates')
      .select('id')
      .eq('user_id', user.id)
      .single();
      
    if (data) {
      // Update existing record
      await supabase
        .from('earning_updates')
        .update({ last_update_date: date })
        .eq('user_id', user.id);
    } else {
      // Create new record
      await supabase
        .from('earning_updates')
        .insert({ user_id: user.id, last_update_date: date });
    }
  } catch (err) {
    console.error('Error in setLastEarningsUpdateDate:', err);
  }
};
