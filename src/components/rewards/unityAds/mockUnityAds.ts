
import { UnityAdsInterface } from './types';
import { logUnity } from './utils';
import { FALLBACK_AD_DURATION } from './config';

/**
 * Mock implementation of Unity Ads for testing and fallback scenarios
 */
export const mockUnityAds: UnityAdsInterface = {
  isReady: () => {
    logUnity('Mock Unity Ad reporting as ready');
    return true;
  },
  
  show: (callback: () => void) => {
    logUnity('Mock Unity Ad displayed');
    setTimeout(callback, FALLBACK_AD_DURATION);
  },
  
  initialize: () => {
    logUnity('Mock Unity Ads initialized');
  }
};

export default mockUnityAds;
