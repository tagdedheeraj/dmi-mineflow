
import { ADMOB_REWARDED_AD_ID } from './config';

/**
 * Logs AdMob related messages with a prefix
 */
export const logAdMob = (message: string, isError = false): void => {
  const prefix = "AdMob:";
  if (isError) {
    console.error(`${prefix} ${message}`);
  } else {
    console.log(`${prefix} ${message}`);
  }
};

/**
 * Checks if AdMob SDK is properly loaded
 */
export const isAdMobSdkLoaded = (): boolean => {
  return typeof window !== 'undefined' && !!window.admob;
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
