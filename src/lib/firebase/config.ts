
import { 
  collection
} from "firebase/firestore";
import { db } from "../firebase";

// Firestore collection references
export const usersCollection = collection(db, 'users');
export const miningSessionsCollection = collection(db, 'mining_sessions');
export const deviceRegistrationsCollection = collection(db, 'device_registrations');
export const plansCollection = collection(db, 'plans');

export { db };
