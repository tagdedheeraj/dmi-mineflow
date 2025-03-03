
import { supabase } from "./client";

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
