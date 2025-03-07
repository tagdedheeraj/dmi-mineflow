import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  serverTimestamp,
  collection,
  doc as docRef
} from "firebase/firestore";
import { db, auth } from "../firebase";

export {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  serverTimestamp,
  collection,
  docRef,
  db,
  auth
};

// Helper to get device ID (keeping local storage for this)
export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('dmi_device_id');
  
  if (!deviceId) {
    // Generate a unique ID for this device
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('dmi_device_id', deviceId);
  }
  
  return deviceId;
};
