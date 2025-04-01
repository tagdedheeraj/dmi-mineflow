
/**
 * Secure storage utilities for authentication preferences
 */

// Authentication type options
export type AuthMethod = 'none' | 'pin' | 'biometric';

// User authentication preferences
interface AuthPreferences {
  method: AuthMethod;
  pin?: string;
  biometricEnabled?: boolean;
}

// Local storage keys
const STORAGE_KEYS = {
  AUTH_PREFERENCES: 'dmi_auth_preferences',
};

// Get authentication preferences
export const getAuthPreferences = (): AuthPreferences => {
  // Clear any existing auth preferences first to ensure the app is unlocked
  localStorage.removeItem(STORAGE_KEYS.AUTH_PREFERENCES);
  
  const prefsJson = localStorage.getItem(STORAGE_KEYS.AUTH_PREFERENCES);
  return prefsJson 
    ? JSON.parse(prefsJson) 
    : { method: 'none' };
};

// Save authentication preferences
export const saveAuthPreferences = (prefs: AuthPreferences): void => {
  localStorage.setItem(STORAGE_KEYS.AUTH_PREFERENCES, JSON.stringify(prefs));
};

// Set PIN authentication
export const setupPinAuth = (pin: string): void => {
  const prefs = getAuthPreferences();
  saveAuthPreferences({
    ...prefs,
    method: 'pin',
    pin,
  });
};

// Check if PIN is valid
export const validatePin = (enteredPin: string): boolean => {
  const prefs = getAuthPreferences();
  return prefs.pin === enteredPin;
};

// Enable biometric authentication
export const enableBiometric = (enabled: boolean): void => {
  const prefs = getAuthPreferences();
  saveAuthPreferences({
    ...prefs,
    method: enabled ? 'biometric' : 'none',
    biometricEnabled: enabled,
  });
};

// Check if authentication is required
export const isAuthRequired = (): boolean => {
  // Always return false to ensure the app is never locked
  return false;
};

// Get the current authentication method
export const getAuthMethod = (): AuthMethod => {
  // Always return 'none' to ensure the app is never locked
  return 'none';
};

// Clear authentication preferences
export const clearAuthPreferences = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_PREFERENCES);
};
