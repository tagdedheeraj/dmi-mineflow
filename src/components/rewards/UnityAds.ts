
// This file is now just a re-export for backward compatibility
import UnityAdsImplementation from './unityAds/unityAdsImplementation';
import mockUnityAds from './unityAds/mockUnityAds';
import { UnityAdsInterface } from './unityAds/types';

// Create instance here instead of importing it
const unityAds: UnityAdsInterface = new UnityAdsImplementation();

// Export the implementations
export { unityAds, mockUnityAds };
export type { UnityAdsInterface };

// This file is deprecated. 
// Please import directly from './unityAds' directory in new code.
