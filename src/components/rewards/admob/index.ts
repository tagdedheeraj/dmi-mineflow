
import AdMobImplementation from './adMobImplementation';
import mockAdMob from './mockAdMob';
import { AdMobInterface } from './types';

// Create and export singleton instance
const adMob: AdMobInterface = new AdMobImplementation();

// Export mock implementation for testing and fallback
export { adMob, mockAdMob };

// Re-export types
export * from './types';

// Re-export utility functions
export * from './utils';

// Re-export config
export * from './config';
