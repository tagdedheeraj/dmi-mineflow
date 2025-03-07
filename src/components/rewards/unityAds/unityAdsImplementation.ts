
import { UnityAdsInterface } from './types';
import { 
  UNITY_GAME_ID, 
  UNITY_PLACEMENT_ID, 
  UNITY_PROJECT_ID, 
  TEST_MODE,
  MAX_INIT_ATTEMPTS,
  SDK_INIT_DELAY,
  RETRY_DELAY,
  FALLBACK_AD_DURATION
} from './config';
import { logUnity, isUnitySdkLoaded, loadScript } from './utils';

/**
 * Unity Ads Implementation class
 */
class UnityAdsImplementation implements UnityAdsInterface {
  private initialized: boolean = false;
  private isLoading: boolean = false;
  private sdkLoaded: boolean = false;
  private initializationAttempts: number = 0;

  constructor() {
    this.initialize();
  }

  initialize() {
    if (this.initialized || this.isLoading) return;
    
    this.isLoading = true;
    this.initializationAttempts++;
    
    logUnity(`Initializing Unity Ads with Game ID: ${UNITY_GAME_ID} (Attempt ${this.initializationAttempts})`);
    
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      this.isLoading = false;
      return;
    }
    
    // Load Unity Ads SDK script dynamically
    loadScript('https://game-cdn.unityads.unity3d.com/webview/3.0.0/webview.js')
      .then(() => {
        logUnity('SDK loaded successfully');
        this.sdkLoaded = true;
        this.isLoading = false;
        
        // Add a short delay to ensure the SDK is fully loaded
        setTimeout(() => {
          this.initializeUnityServices();
        }, SDK_INIT_DELAY);
      })
      .catch((error) => {
        logUnity(`Failed to load SDK: ${error}`, true);
        this.sdkLoaded = false;
        this.initialized = false;
        this.isLoading = false;
        
        // Retry initialization if we haven't exceeded max attempts
        if (this.initializationAttempts < MAX_INIT_ATTEMPTS) {
          logUnity(`Retrying initialization (Attempt ${this.initializationAttempts + 1}/${MAX_INIT_ATTEMPTS})`);
          setTimeout(() => this.initialize(), RETRY_DELAY);
        }
      });
  }

  private initializeUnityServices() {
    if (!isUnitySdkLoaded()) {
      logUnity('SDK not loaded properly, attempting to use UnityAds directly', true);
      
      if (typeof window !== 'undefined' && window.UnityAds) {
        logUnity('Found UnityAds global object, initializing directly');
        
        try {
          window.UnityAds.initialize(UNITY_GAME_ID, TEST_MODE);
          logUnity('Initialized successfully via UnityAds global');
          this.initialized = true;
          setTimeout(() => this.loadAd(), SDK_INIT_DELAY);
          return;
        } catch (e) {
          logUnity(`Direct initialization failed: ${e}`, true);
        }
      }
      
      this.isLoading = false;
      return;
    }

    try {
      if (window.unity && window.unity.services) {
        window.unity.services.initialize({
          gameId: UNITY_GAME_ID,
          projectId: UNITY_PROJECT_ID,
          testMode: TEST_MODE,
          onComplete: () => {
            logUnity('Initialized successfully');
            this.initialized = true;
            this.loadAd();
          },
          onFailed: (error: any) => {
            logUnity(`Initialization failed: ${error}`, true);
            this.initialized = false;
            this.isLoading = false;
          }
        });
      } else if (window.UnityAds) {
        // Fallback to global UnityAds object
        window.UnityAds.initialize(UNITY_GAME_ID, TEST_MODE);
        logUnity('Initialized successfully via UnityAds global');
        this.initialized = true;
        setTimeout(() => this.loadAd(), SDK_INIT_DELAY);
      } else {
        logUnity('No Unity Ads implementation found', true);
        this.isLoading = false;
      }
    } catch (error) {
      logUnity(`Error during initialization: ${error}`, true);
      this.initialized = false;
      this.isLoading = false;
      
      // Fall back to test mode
      logUnity('Falling back to mock implementation');
      this.initialized = true; // Pretend we're initialized for mock behavior
    }
  }

  loadAd() {
    if (!this.initialized) {
      logUnity('Cannot load ad: not initialized', true);
      return;
    }
    
    if (this.isLoading) {
      logUnity('Ad is already loading', true);
      return;
    }
    
    this.isLoading = true;
    logUnity(`Loading ad with Placement ID: ${UNITY_PLACEMENT_ID}`);
    
    try {
      if (window.unity && window.unity.services && window.unity.services.banner) {
        window.unity.services.banner.load({
          placementId: UNITY_PLACEMENT_ID,
          onComplete: () => {
            logUnity('Ad loaded successfully');
            this.isLoading = false;
          },
          onFailed: (error: any) => {
            logUnity(`Ad failed to load: ${error}`, true);
            this.isLoading = false;
            
            // Try to reload after a delay
            setTimeout(() => {
              this.loadAd();
            }, RETRY_DELAY);
          }
        });
      } else if (window.UnityAds) {
        // Unity Ads SDK might be loaded directly
        logUnity('Using UnityAds global object to load ad');
        window.UnityAds.load(UNITY_PLACEMENT_ID);
        this.isLoading = false;
      } else {
        logUnity('Unity services or banner not available', true);
        this.isLoading = false;
      }
    } catch (error) {
      logUnity(`Error loading ad: ${error}`, true);
      this.isLoading = false;
    }
  }

  isReady(): boolean {
    if (!this.initialized) {
      logUnity('Not initialized yet');
      
      // Re-attempt initialization if needed
      if (!this.isLoading && this.initializationAttempts < MAX_INIT_ATTEMPTS) {
        setTimeout(() => this.initialize(), RETRY_DELAY);
      }
      
      return TEST_MODE; // In test mode, pretend we're ready
    }
    
    // If Unity SDK is available, check if ad is ready
    try {
      if (window.unity && window.unity.services && window.unity.services.banner) {
        const isReady = window.unity.services.banner.isReady(UNITY_PLACEMENT_ID);
        logUnity(`Ad ready status: ${isReady}`);
        
        // If not ready, try to load it
        if (!isReady && !this.isLoading) {
          setTimeout(() => this.loadAd(), RETRY_DELAY);
        }
        
        return isReady;
      } else if (window.UnityAds) {
        // Try with global UnityAds object
        const isReady = window.UnityAds.isReady(UNITY_PLACEMENT_ID);
        logUnity(`Ad ready status (UnityAds global): ${isReady}`);
        
        if (!isReady && !this.isLoading) {
          setTimeout(() => this.loadAd(), RETRY_DELAY);
        }
        
        return isReady;
      }
    } catch (error) {
      logUnity(`Error checking if ad is ready: ${error}`, true);
    }
    
    // Use test mode for development
    if (TEST_MODE) {
      logUnity('Using test mode, reporting ad as ready');
      return true;
    }
    
    return false;
  }

  show(callback: () => void): void {
    logUnity('Attempting to show ad...');
    
    if (!this.initialized) {
      logUnity('Not initialized, trying to initialize now', true);
      this.initialize();
      // Use mock behavior for better user experience
      logUnity('Using fallback for ad display');
      setTimeout(callback, FALLBACK_AD_DURATION);
      return;
    }
    
    if (!this.isReady() && !TEST_MODE) {
      logUnity('Ad not ready, trying to load now', true);
      this.loadAd();
      // Use mock behavior for better user experience
      logUnity('Using fallback for ad display');
      setTimeout(callback, FALLBACK_AD_DURATION);
      return;
    }
    
    logUnity(`Showing ad with Placement ID: ${UNITY_PLACEMENT_ID}`);
    
    try {
      if (window.unity && window.unity.services && window.unity.services.banner) {
        window.unity.services.banner.show({
          placementId: UNITY_PLACEMENT_ID,
          onStart: () => {
            logUnity('Ad started playing');
          },
          onClick: () => {
            logUnity('Ad clicked');
          },
          onComplete: () => {
            logUnity('Ad completed successfully');
            callback();
            // Reload ad for next time
            this.loadAd();
          },
          onSkipped: () => {
            logUnity('Ad skipped by user');
            // Don't reward if skipped
            this.loadAd();
          },
          onFailed: (error: any) => {
            logUnity(`Ad failed to show: ${error}`, true);
            // Fall back to mock behavior for better user experience
            setTimeout(callback, FALLBACK_AD_DURATION);
            this.loadAd();
          }
        });
      } else if (window.UnityAds) {
        // Try with global UnityAds object
        window.UnityAds.show(UNITY_PLACEMENT_ID, {
          onStart: () => logUnity('Ad started playing'),
          onComplete: () => {
            logUnity('Ad completed successfully');
            callback();
            this.loadAd();
          },
          onSkip: () => logUnity('Ad skipped by user'),
          onError: (error: any) => {
            logUnity(`Ad failed to show: ${error}`, true);
            setTimeout(callback, FALLBACK_AD_DURATION);
          }
        });
      } else {
        // Fallback to mock behavior if SDK is not available
        logUnity('SDK not available for showing ad, using fallback mock behavior');
        setTimeout(callback, FALLBACK_AD_DURATION);
      }
    } catch (error) {
      logUnity(`Error showing ad: ${error}`, true);
      // Fallback to mock behavior
      setTimeout(callback, FALLBACK_AD_DURATION);
    }
  }
}

export default UnityAdsImplementation;
