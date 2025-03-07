
import { 
  UNITY_PLACEMENT_ID,
  FALLBACK_AD_DURATION
} from '../config';
import { logUnity } from '../utils';

class UnityAdsDisplay {
  showAd(onComplete: () => void, onError: (error: any) => void) {
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
            onComplete();
          },
          onSkipped: () => {
            logUnity('Ad skipped by user');
            // Don't reward if skipped
            onError('Ad skipped');
          },
          onFailed: (error: any) => {
            logUnity(`Ad failed to show: ${error}`, true);
            // Fall back to mock behavior for better user experience
            setTimeout(onComplete, FALLBACK_AD_DURATION);
          }
        });
      } else if (window.UnityAds) {
        // Try with global UnityAds object
        window.UnityAds.show(UNITY_PLACEMENT_ID, {
          onStart: () => logUnity('Ad started playing'),
          onComplete: () => {
            logUnity('Ad completed successfully');
            onComplete();
          },
          onSkip: () => {
            logUnity('Ad skipped by user');
            onError('Ad skipped');
          },
          onError: (error: any) => {
            logUnity(`Ad failed to show: ${error}`, true);
            setTimeout(onComplete, FALLBACK_AD_DURATION);
          }
        });
      } else {
        // Fallback to mock behavior if SDK is not available
        logUnity('SDK not available for showing ad, using fallback mock behavior');
        setTimeout(onComplete, FALLBACK_AD_DURATION);
      }
    } catch (error) {
      logUnity(`Error showing ad: ${error}`, true);
      // Fallback to mock behavior
      setTimeout(onComplete, FALLBACK_AD_DURATION);
    }
  }
}

export default UnityAdsDisplay;
