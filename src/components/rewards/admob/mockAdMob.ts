
import { AdMobInterface } from './types';
import { logAdMob } from './utils';
import { FALLBACK_AD_DURATION } from './config';

/**
 * Mock implementation of AdMob for testing and fallback scenarios
 */
export const mockAdMob: AdMobInterface = {
  isReady: () => {
    logAdMob('Mock AdMob reporting as ready');
    return true;
  },
  
  show: (callback: () => void) => {
    logAdMob('Mock AdMob ad displayed');
    setTimeout(callback, FALLBACK_AD_DURATION);
  },
  
  initialize: () => {
    logAdMob('Mock AdMob initialized');
  }
};

export default mockAdMob;
