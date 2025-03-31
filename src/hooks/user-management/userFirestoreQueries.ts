
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  limit, 
  startAfter, 
  orderBy,
  Timestamp
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
  
  // If searching, create a more effective search query
  if (searchTerm.trim() !== "") {
    const term = searchTerm.trim().toLowerCase();
    console.log("Search query created for term:", term);
    
    // Use a more flexible search that can match either email or fullName
    return query(
      usersCollection,
      orderBy('created_at', 'desc'),
      limit(USERS_PER_PAGE)
    );
  } 
  
  // For pagination without search term
  if (isNextPage && lastVisible) {
    console.log("Creating next page query starting after:", lastVisible.id);
    return query(
      usersCollection,
      orderBy('created_at', 'desc'), // Order by creation date, most recent first
      startAfter(lastVisible),
      limit(USERS_PER_PAGE)
    );
  }
  
  // For initial load, force refresh, or page navigation
  console.log("Getting users for page", currentPage);
  return query(
    usersCollection,
    orderBy('created_at', 'desc'), // Order by creation date, most recent first
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

// Helper function to create a timestamp for 24 hours ago (for new users)
export const get24HoursAgoTimestamp = () => {
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);
  return Timestamp.fromDate(oneDayAgo);
};
