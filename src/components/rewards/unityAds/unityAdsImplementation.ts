
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
    
    // Load Unity Ads SDK script dynamically
    loadScript('https://frame.unityads.unity3d.com/partner/games/webgl.js')
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
      logUnity('SDK not loaded properly', true);
      this.isLoading = false;
      return;
    }

    try {
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
    } catch (error) {
      logUnity(`Error during initialization: ${error}`, true);
      this.initialized = false;
      this.isLoading = false;
    }
  }

  loadAd() {
    if (!this.initialized || this.isLoading || !this.sdkLoaded) {
      logUnity('Cannot load ad: not fully initialized', true);
      return;
    }
    
    this.isLoading = true;
    logUnity(`Loading ad with Placement ID: ${UNITY_PLACEMENT_ID}`);
    
    try {
      if (isUnitySdkLoaded()) {
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
      } else {
        logUnity('Unity services or banner not available', true);
        this.isLoading = false;
        
        // Try to reinitialize
        setTimeout(() => {
          if (!this.initialized && this.initializationAttempts < MAX_INIT_ATTEMPTS) {
            this.initialize();
          }
        }, RETRY_DELAY);
      }
    } catch (error) {
      logUnity(`Error loading ad: ${error}`, true);
      this.isLoading = false;
    }
  }

  isReady(): boolean {
    if (!this.initialized || !this.sdkLoaded) {
      logUnity('Not initialized yet');
      
      // Re-attempt initialization if needed
      if (!this.isLoading && this.initializationAttempts < MAX_INIT_ATTEMPTS) {
        setTimeout(() => this.initialize(), RETRY_DELAY);
      }
      
      return false;
    }
    
    // If Unity SDK is available, check if ad is ready
    try {
      if (isUnitySdkLoaded()) {
        const isReady = window.unity.services.banner.isReady(UNITY_PLACEMENT_ID);
        logUnity(`Ad ready status: ${isReady}`);
        
        // If not ready, try to load it
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
    
    if (!this.initialized || !this.sdkLoaded) {
      logUnity('Not initialized, trying to initialize now', true);
      this.initialize();
      // Use mock behavior for better user experience
      logUnity('Using fallback for ad display');
      setTimeout(callback, FALLBACK_AD_DURATION);
      return;
    }
    
    if (!this.isReady()) {
      logUnity('Ad not ready, trying to load now', true);
      this.loadAd();
      // Use mock behavior for better user experience
      logUnity('Using fallback for ad display');
      setTimeout(callback, FALLBACK_AD_DURATION);
      return;
    }
    
    logUnity(`Showing ad with Placement ID: ${UNITY_PLACEMENT_ID}`);
    
    try {
      // Show the ad if SDK is available
      if (isUnitySdkLoaded()) {
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
