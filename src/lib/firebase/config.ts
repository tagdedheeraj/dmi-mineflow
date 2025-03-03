
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  increment, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  serverTimestamp,
  collection
} from "firebase/firestore";
import { db, usersCollection, miningSessionsCollection, deviceRegistrationsCollection, plansCollection } from "../firebase";

export {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  serverTimestamp,
  collection,
  db,
  usersCollection,
  miningSessionsCollection,
  deviceRegistrationsCollection,
  plansCollection
};
