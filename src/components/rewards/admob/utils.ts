
import { ADMOB_REWARDED_AD_ID, REQUIRED_SDK_VERSION } from './config';

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
  if (typeof window === 'undefined') return false;
  
  // Check for googletag (for Web) or admob (for Mobile Web)
  const hasGoogleTag = !!window.googletag && !!window.googletag.apiReady;
  const hasAdMob = !!window.admob;
  
  if (hasGoogleTag) {
    logAdMob('Google Publisher Tag detected (Web implementation)');
  }
  
  if (hasAdMob) {
    logAdMob('AdMob SDK detected (Mobile Web implementation)');
  }
  
  return hasGoogleTag || hasAdMob;
};

/**
 * Check if the SDK version meets the minimum requirement
 */
export const checkSdkVersion = (currentVersion: string): boolean => {
  if (!currentVersion || currentVersion === 'Unknown') return false;
  
  try {
    // Simple version comparison (major.minor.patch)
    const current = currentVersion.split('.').map(Number);
    const required = REQUIRED_SDK_VERSION.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
      if (current[i] > required[i]) return true;
      if (current[i] < required[i]) return false;
    }
    
    return true; // Versions are equal
  } catch (e) {
    logAdMob(`Error comparing SDK versions: ${e}`, true);
    return false;
  }
};

/**
 * Dynamically load a script
 */
export const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if the script is already loaded
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    script.onload = () => {
      logAdMob(`Successfully loaded script: ${src}`);
      resolve();
    };
    
    script.onerror = (error) => {
      logAdMob(`Failed to load script ${src}: ${error}`, true);
      reject(error);
    };
    
    document.head.appendChild(script);
  });
};

/**
 * Create a hidden container for ads if needed
 */
export const createAdContainer = (id: string = 'rewarded-ad-container'): HTMLElement => {
  let container = document.getElementById(id);
  
  if (!container) {
    container = document.createElement('div');
    container.id = id;
    container.style.position = 'fixed';
    container.style.zIndex = '9999';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.display = 'none';
    document.body.appendChild(container);
    logAdMob(`Created ad container with ID: ${id}`);
  }
  
  return container;
};
