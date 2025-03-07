
// Unity Ads TypeScript type definitions
export interface UnityAdsInterface {
  isReady: () => boolean;
  show: (callback: () => void) => void;
  initialize: () => void;
}

// SDK initialization options
export interface UnityInitOptions {
  gameId: string;
  projectId: string;
  testMode: boolean;
  onComplete: () => void;
  onFailed: (error: any) => void;
}

// Ad loading options
export interface UnityAdLoadOptions {
  placementId: string;
  onComplete: () => void;
  onFailed: (error: any) => void;
}

// Ad display options
export interface UnityAdShowOptions {
  placementId: string;
  onStart: () => void;
  onClick: () => void;
  onComplete: () => void;
  onSkipped: () => void;
  onFailed: (error: any) => void;
}

// Global window interface extension
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
