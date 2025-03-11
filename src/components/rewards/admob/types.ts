
// AdMob TypeScript type definitions
export interface AdMobInterface {
  isReady: () => boolean;
  show: (callback: () => void) => void;
  initialize: () => void;
}

// Global window interface extension for AdMob
declare global {
  interface Window {
    admob?: any;
  }
}
