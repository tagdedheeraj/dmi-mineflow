
import { supabase } from "./client";
import { User } from "./types";

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

// Get last earnings update date for a user
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
