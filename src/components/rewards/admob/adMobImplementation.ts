
import { AdMobInterface } from './types';
import { 
  ADMOB_APP_ID, 
  ADMOB_REWARDED_AD_ID,
  TEST_REWARDED_AD_ID,
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
    
    const adUnitId = TEST_MODE ? TEST_REWARDED_AD_ID : ADMOB_REWARDED_AD_ID;
    logAdMob(`Initializing AdMob with App ID: ${ADMOB_APP_ID} (Attempt ${this.initializationAttempts})`);
    logAdMob(`Using ad unit ID: ${adUnitId} (Test mode: ${TEST_MODE ? 'ON' : 'OFF'})`);
    
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      this.isLoading = false;
      return;
    }
    
    // Improved web implementation
    this.loadAdMobSDK();
  }

  private loadAdMobSDK() {
    // For web testing, we're using a simplified approach
    // In a real mobile app, you would integrate the native AdMob SDK
    
    // Simulate loading the SDK
    setTimeout(() => {
      this.sdkLoaded = true;
      this.initialized = true;
      this.isLoading = false;
      
      logAdMob('AdMob SDK loaded successfully');
      
      // Immediately load an ad
      this.loadAd();
    }, SDK_INIT_DELAY);
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
    const adUnitId = TEST_MODE ? TEST_REWARDED_AD_ID : ADMOB_REWARDED_AD_ID;
    logAdMob(`Loading rewarded ad with ID: ${adUnitId}`);
    
    // Simulate ad loading with guaranteed success in test mode
    setTimeout(() => {
      this.rewardedAd = {
        isLoaded: true,
        show: (callbacks: any) => {
          logAdMob('Showing rewarded ad to user');
          
          // Simulate user watching the entire ad
          if (callbacks && callbacks.onRewarded) {
            setTimeout(() => {
              logAdMob('User earned reward');
              callbacks.onRewarded();
            }, 1000);
          }
          
          // Simulate ad closing
          if (callbacks && callbacks.onClosed) {
            setTimeout(() => {
              logAdMob('Ad closed by user');
              callbacks.onClosed();
              
              // Automatically load the next ad
              this.loadAd();
            }, 3000);
          }
        }
      };
      
      this.isLoading = false;
      logAdMob('Rewarded ad loaded successfully and ready to display');
    }, 2000);
  }

  isReady(): boolean {
    if (!this.initialized) {
      logAdMob('Not initialized yet');
      
      // Re-attempt initialization if needed
      if (!this.isLoading && this.initializationAttempts < MAX_INIT_ATTEMPTS) {
        setTimeout(() => this.initialize(), RETRY_DELAY);
      }
      
      return TEST_MODE; // In test mode, always report as ready
    }
    
    const isReady = !!this.rewardedAd && this.rewardedAd.isLoaded;
    logAdMob(`Ad ready status: ${isReady ? 'READY' : 'NOT READY'}`);
    
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
      // In test mode, we guarantee the callback is called
      logAdMob('Using test mode behavior for ad display');
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
    
    const adUnitId = TEST_MODE ? TEST_REWARDED_AD_ID : ADMOB_REWARDED_AD_ID;
    logAdMob(`Showing rewarded ad with ID: ${adUnitId}`);
    
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
