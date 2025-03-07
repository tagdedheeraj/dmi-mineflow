
import { 
  doc, 
  collection,
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  increment, 
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// Collection references
export const usersCollection = collection(db, 'users');
export const miningSessionsCollection = collection(db, 'mining_sessions');
export const deviceRegistrationsCollection = collection(db, 'device_registrations');
export const plansCollection = collection(db, 'plans');
export const usdtTransactionsCollection = collection(db, 'usdt_transactions');
export const referralsCollection = collection(db, 'referrals');

// Export Firestore functions for use in other modules
export {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  increment,
  serverTimestamp,
};

// Export db instance
export { db };
