
import { UNITY_PLACEMENT_ID } from './config';

/**
 * Logs Unity Ads related messages with a prefix
 */
export const logUnity = (message: string, isError = false): void => {
  const prefix = "Unity Ads:";
  if (isError) {
    console.error(`${prefix} ${message}`);
  } else {
    console.log(`${prefix} ${message}`);
  }
};

/**
 * Checks if Unity SDK is properly loaded
 */
export const isUnitySdkLoaded = (): boolean => {
  return !!(window.unity && window.unity.services);
};

/**
 * Checks if an ad is ready for the default placement
 */
export const checkAdReadyStatus = (): boolean => {
  try {
    if (isUnitySdkLoaded()) {
      return window.unity.services?.banner.isReady(UNITY_PLACEMENT_ID) || false;
    }
  } catch (error) {
    logUnity(`Error checking ad ready status: ${error}`, true);
  }
  return false;
};

/**
 * Dynamically load a script
 */
export const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    script.onload = () => resolve();
    script.onerror = (error) => reject(error);
    
    document.head.appendChild(script);
  });
};
