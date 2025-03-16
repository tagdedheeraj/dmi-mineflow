
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";
import { ActivePlan } from '../storage';

// Plans operations
const plansCollection = collection(db, 'plans');
const membershipCardsCollection = collection(db, 'membership_cards');

export const getActivePlans = async (userId: string): Promise<ActivePlan[]> => {
  try {
    const q = query(plansCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const now = new Date();
    return querySnapshot.docs
      .map(doc => {
        const data = doc.data() as ActivePlan;
        data.id = doc.id;
        return data;
      })
      .filter(plan => new Date(plan.expiresAt) > now);
  } catch (error) {
    console.error("Error fetching active plans:", error);
    return [];
  }
};

export const saveActivePlan = async (userId: string, plan: ActivePlan): Promise<void> => {
  try {
    await addDoc(plansCollection, {
      ...plan,
      userId,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error saving active plan:", error);
  }
};

// Check if user has an active membership
export const hasActiveMembership = async (userId: string): Promise<boolean> => {
  try {
    const membershipRef = collection(db, 'membership_cards');
    const q = query(
      membershipRef,
      where("userId", "==", userId),
      where("isActive", "==", true),
      where("expiresAt", ">=", new Date())
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking active membership:", error);
    return false;
  }
};

// Get user's active membership details
export const getActiveMembership = async (userId: string): Promise<any | null> => {
  try {
    const membershipRef = collection(db, 'membership_cards');
    const q = query(
      membershipRef,
      where("userId", "==", userId),
      where("isActive", "==", true),
      where("expiresAt", ">=", new Date())
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docSnapshot = querySnapshot.docs[0];
      return {
        id: docSnapshot.id,
        ...docSnapshot.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error getting active membership:", error);
    return null;
  }
};

// Save membership card data
export const saveMembershipCard = async (
  userId: string,
  planId: string,
  price: number,
  durationDays: number,
  boostMultiplier: number,
  transactionId?: string
): Promise<string> => {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (durationDays * 24 * 60 * 60 * 1000));
    
    const membershipData = {
      userId,
      planId,
      price,
      purchasedAt: now,
      expiresAt,
      durationDays,
      boostMultiplier,
      isActive: transactionId ? true : false,
      transactionId
    };
    
    const docRef = await addDoc(membershipCardsCollection, membershipData);
    return docRef.id;
  } catch (error) {
    console.error("Error saving membership card:", error);
    throw error;
  }
};

// Activate membership card with transaction ID
export const activateMembershipCard = async (cardId: string, transactionId: string): Promise<boolean> => {
  try {
    const cardRef = doc(db, 'membership_cards', cardId);
    await updateDoc(cardRef, {
      isActive: true,
      transactionId,
      activatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    console.error("Error activating membership card:", error);
    return false;
  }
};
