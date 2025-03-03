
// Mock Unity Ads integration
// In a real app, you would integrate with the Unity Ads SDK
interface UnityAdsInterface {
  isReady: () => boolean;
  show: (callback: () => void) => void;
}

export const mockUnityAds: UnityAdsInterface = {
  isReady: () => true,
  show: (callback: () => void) => {
    // Simulate ad playback for 5 seconds in the demo
    setTimeout(callback, 5000);
  }
};
