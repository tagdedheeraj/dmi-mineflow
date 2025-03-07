
import { UnityAdsInterface } from './types';
import { logUnity } from './utils';
import { FALLBACK_AD_DURATION } from './config';
import UnityAdsInitializer from './modules/unityAdsInitializer';
import UnityAdsLoader from './modules/unityAdsLoader';
import UnityAdsDisplay from './modules/unityAdsDisplay';

/**
 * Unity Ads Implementation class
 */
class UnityAdsImplementation implements UnityAdsInterface {
  private initializer: UnityAdsInitializer;
  private loader: UnityAdsLoader;
  private display: UnityAdsDisplay;

  constructor() {
    this.initializer = new UnityAdsInitializer();
    this.loader = new UnityAdsLoader();
    this.display = new UnityAdsDisplay();
    
    this.initialize();
  }

  initialize() {
    this.initializer.initialize(
      () => this.onInitializationSuccess(),
      (error) => this.onInitializationFailure(error)
    );
  }

  private onInitializationSuccess() {
    logUnity('Initialization successful, loading ad');
    this.loader.loadAd();
  }

  private onInitializationFailure(error: any) {
    logUnity(`Initialization failed: ${error}`, true);
  }

  isReady(): boolean {
    if (!this.initializer.isInitialized()) {
      logUnity('Not initialized yet');
      // Re-attempt initialization if needed
      if (!this.initializer.isLoading() && !this.initializer.hasReachedMaxAttempts()) {
        this.initialize();
      }
      
      return this.initializer.shouldUseFallback(); // In test mode, pretend we're ready
    }
    
    return this.loader.isAdReady();
  }

  show(callback: () => void): void {
    logUnity('Attempting to show ad...');
    
    if (!this.initializer.isInitialized()) {
      logUnity('Not initialized, trying to initialize now', true);
      this.initialize();
      // Use mock behavior for better user experience
      logUnity('Using fallback for ad display');
      setTimeout(callback, FALLBACK_AD_DURATION);
      return;
    }
    
    if (!this.isReady() && !this.initializer.shouldUseFallback()) {
      logUnity('Ad not ready, trying to load now', true);
      this.loader.loadAd();
      // Use mock behavior for better user experience
      logUnity('Using fallback for ad display');
      setTimeout(callback, FALLBACK_AD_DURATION);
      return;
    }
    
    this.display.showAd(
      () => {
        callback();
        // Reload ad for next time
        this.loader.loadAd();
      },
      (error) => {
        logUnity(`Error showing ad: ${error}`, true);
        setTimeout(callback, FALLBACK_AD_DURATION);
      }
    );
  }
}

export default UnityAdsImplementation;
