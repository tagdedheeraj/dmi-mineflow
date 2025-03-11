
// This file is now just a re-export for backward compatibility
import { adMob as unityAds } from './admob';
import { mockAdMob as mockUnityAds } from './admob';
import { AdMobInterface as UnityAdsInterface } from './admob/types';

// Export the implementations
export { unityAds, mockUnityAds };
export type { UnityAdsInterface };

// This file is deprecated. 
// Please import directly from './admob' directory in new code.
