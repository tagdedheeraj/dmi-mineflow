
import { 
  UNITY_PLACEMENT_ID,
  RETRY_DELAY,
  TEST_MODE
} from '../config';
import { logUnity } from '../utils';

class UnityAdsLoader {
  private isLoading: boolean = false;

  loadAd() {
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

  isAdReady(): boolean {
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
    return TEST_MODE;
  }
}

export default UnityAdsLoader;
