import { 
  collection, 
  getDocs, 
  query, 
  where, 
  limit, 
  startAfter, 
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const USERS_PER_PAGE = 10;

// Create query based on pagination state
export const createUserQuery = (
  searchTerm: string,
  lastVisible: any,
  isNextPage: boolean,
  isPrevPage: boolean,
  currentPage: number,
  forceRefresh: boolean
) => {
  console.log("Creating user query with params:", { isNextPage, isPrevPage, forceRefresh, searchTerm });
  const usersCollection = collection(db, 'users');
  
  // If searching, don't use pagination but still get all results
  if (searchTerm.trim() !== "") {
    console.log("Search query created for term:", searchTerm);
    return query(usersCollection, orderBy('fullName'), limit(100));
  } 
  
  // Reset lastVisible when forcing a refresh
  if (forceRefresh) {
    console.log("Force refreshing users list");
    return query(
      usersCollection,
      orderBy('fullName'),
      limit(USERS_PER_PAGE)
    );
  }
  
  // Otherwise use server-side pagination
  if (isNextPage && lastVisible) {
    console.log("Moving to next page with lastVisible:", lastVisible.id);
    return query(
      usersCollection, 
      orderBy('fullName'),
      startAfter(lastVisible),
      limit(USERS_PER_PAGE)
    );
  } 
  
  if (isPrevPage) {
    console.log("Moving to previous page:", currentPage - 1);
    // For previous page, we'll fetch the current page - 1
    return query(
      usersCollection,
      orderBy('fullName'),
      limit(USERS_PER_PAGE * (currentPage - 1))
    );
  } 
  
  console.log("Fetching first page or current page:", currentPage);
  // First page
  return query(
    usersCollection,
    orderBy('fullName'),
    limit(USERS_PER_PAGE)
  );
};

// Get total users count
export const getUsersCount = async () => {
  try {
    console.log("Getting total user count");
    // Get total count more efficiently (may need a counter collection in a production app)
    const countSnapshot = await getDocs(query(collection(db, 'users')));
    console.log("Total users count:", countSnapshot.size);
    return countSnapshot.size;
  } catch (error) {
    console.error("Error getting users count:", error);
    return 0;
  }
};
