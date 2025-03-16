
// This file now serves as a compatibility layer for legacy code
// It re-exports all functionality from the new modular structure

import * as FirebaseOperations from './firebase/index';

// Re-export everything from the new modular structure
export * from './firebase/index';

// For backwards compatibility, also export as a default object
export default FirebaseOperations;
