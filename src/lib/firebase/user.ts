
import { 
  doc, 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from './config';

// User deletion function
export const deleteUserAccount = async (userId: string): Promise<boolean> => {
  try {
    console.log(`Attempting to delete user account: ${userId}`);
    
    // Delete the user document
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    
    // Delete user's mining sessions
    const sessionsQuery = query(
      collection(db, 'mining_sessions'),
      where("userId", "==", userId)
    );
    const sessionsSnapshot = await getDocs(sessionsQuery);
    const sessionDeletePromises = sessionsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(sessionDeletePromises);
    
    // Delete user's active plans
    const plansQuery = query(
      collection(db, 'active_plans'),
      where("userId", "==", userId)
    );
    const plansSnapshot = await getDocs(plansQuery);
    const planDeletePromises = plansSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(planDeletePromises);
    
    // Delete user's USDT transactions
    const transactionsQuery = query(
      collection(db, 'usdt_transactions'),
      where("userId", "==", userId)
    );
    const transactionsSnapshot = await getDocs(transactionsQuery);
    const transactionDeletePromises = transactionsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(transactionDeletePromises);
    
    // Delete user's withdrawal requests
    const withdrawalsQuery = query(
      collection(db, 'withdrawal_requests'),
      where("userId", "==", userId)
    );
    const withdrawalsSnapshot = await getDocs(withdrawalsQuery);
    const withdrawalDeletePromises = withdrawalsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(withdrawalDeletePromises);
    
    // Delete user's plan claims
    const claimsQuery = query(
      collection(db, 'plan_claims'),
      where("userId", "==", userId)
    );
    const claimsSnapshot = await getDocs(claimsQuery);
    const claimDeletePromises = claimsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(claimDeletePromises);
    
    console.log(`Successfully deleted user account and related data: ${userId}`);
    return true;
  } catch (error) {
    console.error("Error deleting user account:", error);
    return false;
  }
};
