
import { DeviceRegistration, STORAGE_KEYS } from './types';

// Generate a unique device ID
export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('dmi_device_id');
  
  if (!deviceId) {
    // Generate a unique ID for this device
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('dmi_device_id', deviceId);
  }
  
  return deviceId;
};

// Device registration operations
export const getDeviceRegistrations = (): DeviceRegistration[] => {
  const registrationsJson = localStorage.getItem(STORAGE_KEYS.DEVICE_REGISTRATIONS);
  return registrationsJson ? JSON.parse(registrationsJson) : [];
};

export const saveDeviceRegistration = (registration: DeviceRegistration): void => {
  const registrations = getDeviceRegistrations();
  const existingIndex = registrations.findIndex(r => r.deviceId === registration.deviceId);
  
  if (existingIndex >= 0) {
    registrations[existingIndex] = registration;
  } else {
    registrations.push(registration);
  }
  
  localStorage.setItem(STORAGE_KEYS.DEVICE_REGISTRATIONS, JSON.stringify(registrations));
};

export const registerAccountOnDevice = (userId: string): { 
  isMultipleAccount: boolean,
  within24Hours: boolean 
} => {
  const deviceId = getDeviceId();
  const registrations = getDeviceRegistrations();
  const deviceRegistration = registrations.find(r => r.deviceId === deviceId) || {
    deviceId,
    accountIds: [],
    firstAccountCreatedAt: Date.now()
  };
  
  // Add the account ID if it's not already registered
  if (!deviceRegistration.accountIds.includes(userId)) {
    deviceRegistration.accountIds.push(userId);
  }
  
  // If this is the first account on this device, update the creation time
  if (deviceRegistration.accountIds.length === 1) {
    deviceRegistration.firstAccountCreatedAt = Date.now();
  }
  
  saveDeviceRegistration(deviceRegistration);
  
  const isMultipleAccount = deviceRegistration.accountIds.length > 1;
  const timeSinceFirstAccount = Date.now() - deviceRegistration.firstAccountCreatedAt;
  const within24Hours = timeSinceFirstAccount < 24 * 60 * 60 * 1000;
  
  return {
    isMultipleAccount,
    within24Hours
  };
};
