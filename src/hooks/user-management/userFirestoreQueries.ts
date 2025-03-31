
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  limit, 
  startAfter, 
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const USERS_PER_PAGE = 10;

// Time window for considering a user as "new" (24 hours in milliseconds)
export const NEW_USER_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Create query based on pagination state
export const createUserQuery = (
  searchTerm: string,
  lastVisible: any,
  isNextPage: boolean,
  isPrevPage: boolean,
  currentPage: number,
  forceRefresh: boolean,
  newUsersOnly: boolean = false
) => {
  console.log("Creating user query with params:", { isNextPage, isPrevPage, forceRefresh, searchTerm, newUsersOnly });
  const usersCollection = collection(db, 'users');
  
  // Calculate the timestamp for 24 hours ago
  const twentyFourHoursAgo = Date.now() - NEW_USER_WINDOW;
  
  // If we're looking for new users only
  if (newUsersOnly) {
    console.log("Filtering for new users created after:", new Date(twentyFourHoursAgo).toISOString());
    return query(
      usersCollection,
      where('createdAt', '>=', twentyFourHoursAgo),
      orderBy('createdAt', 'desc'),
      limit(USERS_PER_PAGE)
    );
  }
  
  // If searching, create a more effective search query
  if (searchTerm.trim() !== "") {
    const term = searchTerm.trim().toLowerCase();
    console.log("Search query created for term:", term);
    
    // Use a more flexible search that can match either email or fullName
    return query(
      usersCollection,
      limit(USERS_PER_PAGE)
    );
  } 
  
  // For pagination without search term
  if (isNextPage && lastVisible) {
    console.log("Creating next page query starting after:", lastVisible.id);
    return query(
      usersCollection,
      orderBy('createdAt', 'desc'), // Order by creation date, newest first
      startAfter(lastVisible),
      limit(USERS_PER_PAGE)
    );
  }
  
  // For initial load, force refresh, or page navigation
  console.log("Getting users for page", currentPage);
  return query(
    usersCollection,
    orderBy('createdAt', 'desc'), // Order by creation date, newest first
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

// Get new users count (created in the last 24 hours)
export const getNewUsersCount = async () => {
  try {
    const twentyFourHoursAgo = Date.now() - NEW_USER_WINDOW;
    console.log("Getting new users count (created after:", new Date(twentyFourHoursAgo).toISOString() + ")");
    
    const newUsersQuery = query(
      collection(db, 'users'),
      where('createdAt', '>=', twentyFourHoursAgo)
    );
    
    const countSnapshot = await getDocs(newUsersQuery);
    console.log("New users count:", countSnapshot.size);
    return countSnapshot.size;
  } catch (error) {
    console.error("Error getting new users count:", error);
    return 0;
  }
};
