
import UnityAdsImplementation from './unityAdsImplementation';
import mockUnityAds from './mockUnityAds';
import { UnityAdsInterface } from './types';

// Create and export singleton instance
const unityAds: UnityAdsInterface = new UnityAdsImplementation();

// Export mock implementation for testing and fallback
export { unityAds, mockUnityAds };

// Re-export types
export * from './types';

// Re-export utility functions
export * from './utils';

// Re-export config
export * from './config';
