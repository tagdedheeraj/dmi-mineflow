
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  collection, 
  query, 
  where, 
  getDocs 
} from "firebase/firestore";
import { db } from "../firebase";
import { User } from '../storage';

// User operations
export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as User;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export const saveUser = async (user: User): Promise<void> => {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, user, { merge: true });
  } catch (error) {
    console.error("Error saving user:", error);
  }
};

export const updateUserBalance = async (userId: string, amount: number): Promise<User | null> => {
  try {
    console.log(`[Firestore] Updating user ${userId} balance by adding ${amount} DMI coins`);
    const userRef = doc(db, 'users', userId);
    
    // First, get the current user data to log the before/after balance for debugging
    const userBefore = await getUser(userId);
    if (userBefore) {
      console.log(`[Firestore] User balance before update: ${userBefore.balance} DMI`);
    }
    
    // Use Firestore's increment() function to properly add to the existing balance
    await updateDoc(userRef, {
      balance: increment(amount)
    });
    
    // Fetch and return the updated user
    const updatedUser = await getUser(userId);
    if (updatedUser) {
      console.log(`[Firestore] User balance after update: ${updatedUser.balance} DMI`);
    }
    return updatedUser;
  } catch (error) {
    console.error("Error updating user balance:", error);
    return null;
  }
};

export const setUsdtAddress = async (userId: string, address: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      usdtAddress: address
    });
    
    // Fetch and return the updated user
    return await getUser(userId);
  } catch (error) {
    console.error("Error setting USDT address:", error);
    return null;
  }
};

export const updateUsdtEarnings = async (userId: string, amount: number): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      usdtEarnings: increment(amount)
    });
    
    // Fetch and return the updated user
    return await getUser(userId);
  } catch (error) {
    console.error("Error updating USDT earnings:", error);
    return null;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as User;
      userData.id = userDoc.id;
      return userData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
};

// Helper function to track daily earnings updates
export const getLastUsdtUpdateDate = async (userId: string): Promise<string | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && userDoc.data().lastUsdtEarningsUpdate) {
      return userDoc.data().lastUsdtEarningsUpdate;
    }
    return null;
  } catch (error) {
    console.error("Error getting last USDT update date:", error);
    return null;
  }
};

export const updateLastUsdtUpdateDate = async (userId: string, date: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastUsdtEarningsUpdate: date
    });
  } catch (error) {
    console.error("Error updating last USDT update date:", error);
  }
};
