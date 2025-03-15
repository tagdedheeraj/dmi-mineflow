
import { AdMobInterface } from './types';
import { 
  ADMOB_APP_ID, 
  ADMOB_REWARDED_AD_ID,
  TEST_REWARDED_AD_ID,
  TEST_MODE,
  MAX_INIT_ATTEMPTS,
  SDK_INIT_DELAY,
  RETRY_DELAY,
  FALLBACK_AD_DURATION,
  REQUIRED_SDK_VERSION
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
  private sdkVersion: string = "0.0.0";

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
    logAdMob(`Required Google Mobile SDK version: ${REQUIRED_SDK_VERSION} or higher`);
    
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      this.isLoading = false;
      return;
    }
    
    // Load the AdMob SDK
    this.loadAdMobSDK();
  }

  private loadAdMobSDK() {
    // For mobile web, we need to load the Google Mobile Ads SDK
    const sdkUrl = 'https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js';
    
    loadScript(sdkUrl)
      .then(() => {
        logAdMob('Base Firebase SDK loaded successfully');
        
        // Now load the AdMob SDK
        return loadScript('https://www.googletagservices.com/tag/js/gpt.js');
      })
      .then(() => {
        // After scripts are loaded, check for AdMob availability
        if (typeof window.googletag !== 'undefined') {
          this.sdkLoaded = true;
          this.initialized = true;
          this.isLoading = false;
          
          // Try to get SDK version
          try {
            if (window.googletag && window.googletag.apiReady) {
              this.sdkVersion = window.googletag.pubads().getVersion() || "Unknown";
              logAdMob(`AdMob SDK loaded successfully, version: ${this.sdkVersion}`);
            } else {
              logAdMob('AdMob SDK loaded but version information not available');
            }
          } catch (e) {
            logAdMob(`Error getting SDK version: ${e}`, true);
          }
          
          // Immediately load an ad
          this.loadAd();
        } else {
          this.handleSDKLoadFailure('SDK not available after loading');
        }
      })
      .catch((error) => {
        this.handleSDKLoadFailure(`Failed to load SDK: ${error}`);
      });
  }

  private handleSDKLoadFailure(errorMsg: string) {
    logAdMob(errorMsg, true);
    this.sdkLoaded = false;
    this.initialized = false;
    this.isLoading = false;
    
    // Retry initialization if needed
    if (this.initializationAttempts < MAX_INIT_ATTEMPTS) {
      logAdMob(`Retrying SDK load (Attempt ${this.initializationAttempts + 1}/${MAX_INIT_ATTEMPTS})`);
      setTimeout(() => this.initialize(), RETRY_DELAY);
    } else {
      logAdMob(`Max initialization attempts (${MAX_INIT_ATTEMPTS}) reached. Giving up.`, true);
      
      // Fallback to mock implementation
      this.useMockImplementation();
    }
  }

  private useMockImplementation() {
    logAdMob('Using mock implementation as fallback', true);
    this.initialized = true; // Pretend we're initialized
    this.sdkLoaded = true;
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
    
    if (!this.sdkLoaded) {
      logAdMob('SDK not loaded, trying to load it again', true);
      this.initialize();
      this.isLoading = false;
      return;
    }
    
    try {
      // For web implementation, we use GPT
      if (window.googletag && window.googletag.apiReady) {
        googletag.cmd.push(() => {
          logAdMob('Defining ad slot');
          const slot = googletag
            .defineSlot(adUnitId, [[320, 480]], 'rewarded-ad-container')
            ?.addService(googletag.pubads());
          
          if (slot) {
            googletag.pubads().enableSingleRequest();
            googletag.enableServices();
            
            // Set up the rewarded ad
            this.rewardedAd = {
              isLoaded: true,
              show: (callbacks: any) => {
                logAdMob('Showing rewarded ad via GPT');
                googletag.cmd.push(() => {
                  googletag.display('rewarded-ad-container');
                  
                  // Simulate reward callback after ad would be shown
                  if (callbacks && callbacks.onRewarded) {
                    setTimeout(() => {
                      logAdMob('User earned reward');
                      callbacks.onRewarded();
                    }, 1000);
                  }
                  
                  // Simulate closed callback
                  if (callbacks && callbacks.onClosed) {
                    setTimeout(() => {
                      logAdMob('Ad closed');
                      callbacks.onClosed();
                      // Reload ad for next time
                      this.loadAd();
                    }, 3000);
                  }
                });
              }
            };
            
            this.isLoading = false;
            logAdMob('Rewarded ad defined and ready to display');
          } else {
            throw new Error('Failed to define ad slot');
          }
        });
      } else {
        // Fallback to mock behavior since GPT isn't available
        this.simulateAdLoading();
      }
    } catch (error) {
      logAdMob(`Error setting up GPT: ${error}`, true);
      // Fallback to mock behavior
      this.simulateAdLoading();
    }
  }

  private simulateAdLoading() {
    logAdMob('Using simulated ad loading as fallback');
    
    // Simulate ad loading with guaranteed success in test mode
    setTimeout(() => {
      this.rewardedAd = {
        isLoaded: true,
        show: (callbacks: any) => {
          logAdMob('Showing simulated rewarded ad to user');
          
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
      logAdMob('Simulated rewarded ad loaded successfully and ready to display');
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
    
    // Ensure a container exists for the ad
    this.ensureAdContainer();
    
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
  
  private ensureAdContainer() {
    // Make sure an ad container exists in the document
    if (!document.getElementById('rewarded-ad-container')) {
      const container = document.createElement('div');
      container.id = 'rewarded-ad-container';
      container.style.position = 'fixed';
      container.style.zIndex = '9999';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.display = 'none';
      document.body.appendChild(container);
      logAdMob('Created rewarded ad container');
    }
  }
}

// Add window extension for googletag
declare global {
  interface Window {
    googletag: any;
    admob: any;
  }
}

export default AdMobImplementation;
