
import { AdMobInterface } from './types';
import { 
  ADMOB_APP_ID, 
  ADMOB_REWARDED_AD_ID, 
  TEST_MODE,
  MAX_INIT_ATTEMPTS,
  SDK_INIT_DELAY,
  RETRY_DELAY,
  FALLBACK_AD_DURATION
} from './config';
import { logAdMob, isAdMobSdkLoaded, loadScript } from './utils';

/**
 * AdMob Implementation class
 */
class AdMobImplementation implements AdMobInterface {
  private initialized: boolean = false;
  private isLoading: boolean = false;
  private sdkLoaded: boolean = false;
  private initializationAttempts: number = 0;
  private rewardedAd: any = null;

  constructor() {
    this.initialize();
  }

  initialize() {
    if (this.initialized || this.isLoading) return;
    
    this.isLoading = true;
    this.initializationAttempts++;
    
    logAdMob(`Initializing AdMob with App ID: ${ADMOB_APP_ID} (Attempt ${this.initializationAttempts})`);
    
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      this.isLoading = false;
      return;
    }
    
    // For web implementation, we use the Google IMA SDK for now
    // In a real mobile implementation, we would use the Capacitor AdMob plugin
    this.loadAdMobSDK();
  }

  private loadAdMobSDK() {
    // For web testing, we're using a simplified approach
    // In a real app with Capacitor, you would use the AdMob plugin
    this.sdkLoaded = true;
    this.initialized = true;
    this.isLoading = false;
    
    logAdMob('AdMob initialized for web testing');
    
    // Simulate loading an ad
    this.loadAd();
  }

  loadAd() {
    if (!this.initialized) {
      logAdMob('Cannot load ad: not initialized', true);
      return;
    }
    
    if (this.isLoading) {
      logAdMob('Ad is already loading', true);
      return;
    }
    
    this.isLoading = true;
    logAdMob(`Loading rewarded ad with ID: ${ADMOB_REWARDED_AD_ID}`);
    
    // Simulate ad loading
    setTimeout(() => {
      this.rewardedAd = {
        isLoaded: true,
        show: (callbacks: any) => {
          if (callbacks && callbacks.onRewarded) {
            setTimeout(() => {
              callbacks.onRewarded();
            }, 1000);
          }
          if (callbacks && callbacks.onClosed) {
            setTimeout(() => {
              callbacks.onClosed();
            }, 3000);
          }
        }
      };
      
      this.isLoading = false;
      logAdMob('Rewarded ad loaded successfully');
    }, 1000);
  }

  isReady(): boolean {
    if (!this.initialized) {
      logAdMob('Not initialized yet');
      
      // Re-attempt initialization if needed
      if (!this.isLoading && this.initializationAttempts < MAX_INIT_ATTEMPTS) {
        setTimeout(() => this.initialize(), RETRY_DELAY);
      }
      
      return TEST_MODE; // In test mode, pretend we're ready
    }
    
    const isReady = !!this.rewardedAd && this.rewardedAd.isLoaded;
    
    // If not ready, try to load it
    if (!isReady && !this.isLoading) {
      setTimeout(() => this.loadAd(), RETRY_DELAY);
    }
    
    return isReady || TEST_MODE;
  }

  show(callback: () => void): void {
    logAdMob('Attempting to show ad...');
    
    if (!this.initialized) {
      logAdMob('Not initialized, trying to initialize now', true);
      this.initialize();
      // Use mock behavior for better user experience
      logAdMob('Using fallback for ad display');
      setTimeout(callback, FALLBACK_AD_DURATION);
      return;
    }
    
    if (!this.isReady() && !TEST_MODE) {
      logAdMob('Ad not ready, trying to load now', true);
      this.loadAd();
      // Use mock behavior for better user experience
      logAdMob('Using fallback for ad display');
      setTimeout(callback, FALLBACK_AD_DURATION);
      return;
    }
    
    logAdMob(`Showing rewarded ad with ID: ${ADMOB_REWARDED_AD_ID}`);
    
    if (this.rewardedAd && this.rewardedAd.show) {
      this.rewardedAd.show({
        onRewarded: () => {
          logAdMob('User rewarded for watching the ad');
        },
        onClosed: () => {
          logAdMob('Ad closed - executing callback');
          callback();
          // Reload ad for next time
          this.loadAd();
        },
        onFailedToShow: (error: any) => {
          logAdMob(`Failed to show ad: ${error}`, true);
          // Fall back to mock behavior
          setTimeout(callback, FALLBACK_AD_DURATION);
          this.loadAd();
        }
      });
    } else {
      // Fallback to mock behavior
      logAdMob('Rewarded ad not available, using fallback behavior');
      setTimeout(callback, FALLBACK_AD_DURATION);
      this.loadAd();
    }
  }
}

export default AdMobImplementation;
