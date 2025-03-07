
// This file is now just a re-export for backward compatibility
import { unityAds, mockUnityAds, UnityAdsInterface } from './unityAds';

// Re-export the main implementations
export { unityAds, mockUnityAds };
export type { UnityAdsInterface };

// This file is deprecated. 
// Please import directly from './unityAds' directory in new code.
