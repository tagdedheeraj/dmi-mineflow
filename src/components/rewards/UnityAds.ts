// Real Unity Ads SDK integration
interface UnityAdsInterface {
  isReady: () => boolean;
  show: (callback: () => void) => void;
  initialize: () => void;
}

// Game credentials
const UNITY_GAME_ID = "5801906";
const UNITY_PLACEMENT_ID = "Rewarded_Android";
const UNITY_PROJECT_ID = "bedf5970-debb-484e-ab33-b53e2271e0ef";
const TEST_MODE = false; // Changed to false for live ads

class UnityAdsImplementation implements UnityAdsInterface {
  private initialized: boolean = false;
  private isLoading: boolean = false;
  private sdkLoaded: boolean = false;
  private initializationAttempts: number = 0;
  private readonly MAX_INIT_ATTEMPTS = 3;

  constructor() {
    this.initialize();
  }

  initialize() {
    if (this.initialized || this.isLoading) return;
    
    this.isLoading = true;
    this.initializationAttempts++;
    
    console.log(`Initializing Unity Ads with Game ID: ${UNITY_GAME_ID} (Attempt ${this.initializationAttempts})`);
    
    // Load Unity Ads SDK script dynamically
    const script = document.createElement('script');
    script.src = 'https://frame.unityads.unity3d.com/partner/games/webgl.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Unity Ads SDK loaded successfully');
      this.sdkLoaded = true;
      this.isLoading = false;
      
      // Add a short delay to ensure the SDK is fully loaded
      setTimeout(() => {
        this.initializeUnityServices();
      }, 1000);
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Unity Ads SDK:', error);
      this.sdkLoaded = false;
      this.initialized = false;
      this.isLoading = false;
      
      // Retry initialization if we haven't exceeded max attempts
      if (this.initializationAttempts < this.MAX_INIT_ATTEMPTS) {
        console.log(`Retrying Unity Ads initialization (Attempt ${this.initializationAttempts + 1}/${this.MAX_INIT_ATTEMPTS})`);
        setTimeout(() => this.initialize(), 3000);
      }
    };
    
    document.head.appendChild(script);
  }

  private initializeUnityServices() {
    if (!this.sdkLoaded || typeof window.unity === 'undefined') {
      console.error('Unity SDK not loaded properly');
      this.isLoading = false;
      return;
    }

    try {
      window.unity.services.initialize({
        gameId: UNITY_GAME_ID,
        projectId: UNITY_PROJECT_ID,
        testMode: TEST_MODE, // Enable test mode for debugging
        onComplete: () => {
          console.log('Unity Ads initialized successfully');
          this.initialized = true;
          this.loadAd();
        },
        onFailed: (error: any) => {
          console.error('Unity Ads initialization failed:', error);
          this.initialized = false;
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error during Unity initialization:', error);
      this.initialized = false;
      this.isLoading = false;
    }
  }

  loadAd() {
    if (!this.initialized || this.isLoading || !this.sdkLoaded) {
      console.warn('Cannot load ad: Unity not fully initialized');
      return;
    }
    
    this.isLoading = true;
    console.log('Loading Unity Ad with Placement ID:', UNITY_PLACEMENT_ID);
    
    try {
      if (window.unity && window.unity.services && window.unity.services.banner) {
        window.unity.services.banner.load({
          placementId: UNITY_PLACEMENT_ID,
          onComplete: () => {
            console.log('Unity Ad loaded successfully');
            this.isLoading = false;
          },
          onFailed: (error: any) => {
            console.error('Unity Ad failed to load:', error);
            this.isLoading = false;
            
            // Try to reload after a delay
            setTimeout(() => {
              this.loadAd();
            }, 5000);
          }
        });
      } else {
        console.error('Unity services or banner not available');
        this.isLoading = false;
        
        // Try to reinitialize
        setTimeout(() => {
          if (!this.initialized && this.initializationAttempts < this.MAX_INIT_ATTEMPTS) {
            this.initialize();
          }
        }, 5000);
      }
    } catch (error) {
      console.error('Error loading Unity ad:', error);
      this.isLoading = false;
    }
  }

  isReady(): boolean {
    if (!this.initialized || !this.sdkLoaded) {
      console.log('Unity Ads not initialized yet');
      
      // Re-attempt initialization if needed
      if (!this.isLoading && this.initializationAttempts < this.MAX_INIT_ATTEMPTS) {
        setTimeout(() => this.initialize(), 1000);
      }
      
      return false;
    }
    
    // If Unity SDK is available, check if ad is ready
    try {
      if (window.unity && window.unity.services && window.unity.services.banner) {
        const isReady = window.unity.services.banner.isReady(UNITY_PLACEMENT_ID);
        console.log('Unity Ad ready status:', isReady);
        
        // If not ready, try to load it
        if (!isReady && !this.isLoading) {
          setTimeout(() => this.loadAd(), 1000);
        }
        
        return isReady;
      }
    } catch (error) {
      console.error('Error checking if Unity ad is ready:', error);
    }
    
    // Use test mode for development
    if (TEST_MODE) {
      console.log('Using test mode, reporting ad as ready');
      return true;
    }
    
    return false;
  }

  show(callback: () => void): void {
    console.log('Attempting to show Unity Ad...');
    
    if (!this.initialized || !this.sdkLoaded) {
      console.warn('Unity Ads not initialized, trying to initialize now');
      this.initialize();
      // Use mock behavior for better user experience
      console.log('Using fallback for ad display');
      setTimeout(callback, 5000);
      return;
    }
    
    if (!this.isReady()) {
      console.warn('Unity Ad not ready, trying to load now');
      this.loadAd();
      // Use mock behavior for better user experience
      console.log('Using fallback for ad display');
      setTimeout(callback, 5000);
      return;
    }
    
    console.log('Showing Unity Ad with Placement ID:', UNITY_PLACEMENT_ID);
    
    try {
      // Show the ad if SDK is available
      if (window.unity && window.unity.services && window.unity.services.banner) {
        window.unity.services.banner.show({
          placementId: UNITY_PLACEMENT_ID,
          onStart: () => {
            console.log('Unity Ad started playing');
          },
          onClick: () => {
            console.log('Unity Ad clicked');
          },
          onComplete: () => {
            console.log('Unity Ad completed successfully');
            callback();
            // Reload ad for next time
            this.loadAd();
          },
          onSkipped: () => {
            console.log('Unity Ad skipped by user');
            // Don't reward if skipped
            this.loadAd();
          },
          onFailed: (error: any) => {
            console.error('Unity Ad failed to show:', error);
            // Fall back to mock behavior for better user experience
            setTimeout(callback, 5000);
            this.loadAd();
          }
        });
      } else {
        // Fallback to mock behavior if SDK is not available
        console.log('Unity SDK not available for showing ad, using fallback mock behavior');
        setTimeout(callback, 5000);
      }
    } catch (error) {
      console.error('Error showing Unity Ad:', error);
      // Fallback to mock behavior
      setTimeout(callback, 5000);
    }
  }
}

// Add Unity TypeScript definitions
declare global {
  interface Window {
    unity?: {
      services?: {
        initialize: (options: any) => void;
        banner: {
          load: (options: any) => void;
          show: (options: any) => void;
          isReady: (placementId: string) => boolean;
        };
      };
    };
  }
}

// Create and export singleton instance
export const unityAds: UnityAdsInterface = new UnityAdsImplementation();

// Keep the mock implementation for testing and fallback
export const mockUnityAds: UnityAdsInterface = {
  isReady: () => true,
  show: (callback: () => void) => {
    console.log('Mock Unity Ad displayed');
    setTimeout(callback, 5000);
  },
  initialize: () => {
    console.log('Mock Unity Ads initialized');
  }
};
