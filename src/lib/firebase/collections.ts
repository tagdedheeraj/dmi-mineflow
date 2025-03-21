
import { collection } from 'firebase/firestore';
import { db } from './config';

// Firestore collection references
export const usersCollection = collection(db, 'users');
export const miningSessionsCollection = collection(db, 'mining_sessions');
export const deviceRegistrationsCollection = collection(db, 'device_registrations');
export const plansCollection = collection(db, 'plans');
export const membershipCardsCollection = collection(db, 'membership_cards');
export const transactionsCollection = collection(db, 'usdt_transactions');
