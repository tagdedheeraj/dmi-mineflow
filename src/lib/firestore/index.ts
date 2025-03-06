
/**
 * Main export file for all firestore operations
 * Re-exports all functionality from specialized modules
 */

// Re-export all functions for backward compatibility
export * from './userOperations';
export * from './miningOperations';
export * from './planOperations';
export * from './deviceOperations';
export * from './referralOperations';
export * from './transactionOperations';
export * from './helperFunctions';

// Export the collections from firebase.ts as well to maintain compatibility
export { 
  usersCollection, 
  miningSessionsCollection, 
  deviceRegistrationsCollection, 
  plansCollection 
} from '../firebase';
