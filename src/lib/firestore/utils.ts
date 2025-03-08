
import { doc } from "firebase/firestore";
import { db } from "../firebase";

// Helper function to create doc reference - needed for compatibility
export const docRef = (firestore: any, collection: string, docId: string) => {
  return doc(firestore, collection, docId);
};
