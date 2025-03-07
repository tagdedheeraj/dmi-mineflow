
import { 
  UNITY_GAME_ID, 
  UNITY_PROJECT_ID, 
  TEST_MODE,
  MAX_INIT_ATTEMPTS,
  SDK_INIT_DELAY,
  RETRY_DELAY
} from '../config';
import { logUnity, isUnitySdkLoaded, loadScript } from '../utils';

class UnityAdsInitializer {
  private initialized: boolean = false;
  private isLoading: boolean = false;
  private sdkLoaded: boolean = false;
  private initializationAttempts: number = 0;

  initialize(onSuccess: () => void, onFailure: (error: any) => void) {
    if (this.initialized || this.isLoading) return;
    
    this.isLoading = true;
    this.initializationAttempts++;
    
    logUnity(`Initializing Unity Ads with Game ID: ${UNITY_GAME_ID} (Attempt ${this.initializationAttempts})`);
    
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      this.isLoading = false;
      onFailure('Not in browser environment');
      return;
    }
    
    // Load Unity Ads SDK script dynamically
    this.loadSdk()
      .then(() => {
        this.initializeUnityServices(onSuccess, onFailure);
      })
      .catch(error => {
        this.handleSdkLoadError(error, onFailure);
      });
  }

  private loadSdk(): Promise<void> {
    return loadScript('https://game-cdn.unityads.unity3d.com/webview/3.0.0/webview.js')
      .then(() => {
        logUnity('SDK loaded successfully');
        this.sdkLoaded = true;
        this.isLoading = false;
        return new Promise<void>(resolve => {
          // Add a short delay to ensure the SDK is fully loaded
          setTimeout(resolve, SDK_INIT_DELAY);
        });
      });
  }

  private handleSdkLoadError(error: any, onFailure: (error: any) => void) {
    logUnity(`Failed to load SDK: ${error}`, true);
    this.sdkLoaded = false;
    this.initialized = false;
    this.isLoading = false;
    
    // Retry initialization if we haven't exceeded max attempts
    if (this.initializationAttempts < MAX_INIT_ATTEMPTS) {
      logUnity(`Retrying initialization (Attempt ${this.initializationAttempts + 1}/${MAX_INIT_ATTEMPTS})`);
      setTimeout(() => this.initialize(onFailure, onFailure), RETRY_DELAY);
    } else {
      onFailure(error);
    }
  }

  private initializeUnityServices(onSuccess: () => void, onFailure: (error: any) => void) {
    if (!isUnitySdkLoaded()) {
      return this.initializeWithFallback(onSuccess, onFailure);
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
            onSuccess();
          },
          onFailed: (error: any) => {
            logUnity(`Initialization failed: ${error}`, true);
            this.initialized = false;
            this.isLoading = false;
            onFailure(error);
          }
        });
      } else if (window.UnityAds) {
        // Fallback to global UnityAds object
        window.UnityAds.initialize(UNITY_GAME_ID, TEST_MODE);
        logUnity('Initialized successfully via UnityAds global');
        this.initialized = true;
        setTimeout(onSuccess, SDK_INIT_DELAY);
      } else {
        logUnity('No Unity Ads implementation found', true);
        this.isLoading = false;
        onFailure('No Unity Ads implementation found');
      }
    } catch (error) {
      logUnity(`Error during initialization: ${error}`, true);
      this.initialized = false;
      this.isLoading = false;
      
      // Fall back to test mode
      if (TEST_MODE) {
        logUnity('Falling back to mock implementation');
        this.initialized = true; // Pretend we're initialized for mock behavior
        onSuccess();
      } else {
        onFailure(error);
      }
    }
  }

  private initializeWithFallback(onSuccess: () => void, onFailure: (error: any) => void) {
    logUnity('SDK not loaded properly, attempting to use UnityAds directly', true);
    
    if (typeof window !== 'undefined' && window.UnityAds) {
      logUnity('Found UnityAds global object, initializing directly');
      
      try {
        window.UnityAds.initialize(UNITY_GAME_ID, TEST_MODE);
        logUnity('Initialized successfully via UnityAds global');
        this.initialized = true;
        setTimeout(onSuccess, SDK_INIT_DELAY);
        return;
      } catch (e) {
        logUnity(`Direct initialization failed: ${e}`, true);
      }
    }
    
    this.isLoading = false;
    if (TEST_MODE) {
      logUnity('Test mode enabled, using mock implementation');
      this.initialized = true;
      onSuccess();
    } else {
      onFailure('Failed to initialize Unity Ads');
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  isLoading(): boolean {
    return this.isLoading;
  }

  hasReachedMaxAttempts(): boolean {
    return this.initializationAttempts >= MAX_INIT_ATTEMPTS;
  }

  shouldUseFallback(): boolean {
    return TEST_MODE;
  }
}

export default UnityAdsInitializer;
