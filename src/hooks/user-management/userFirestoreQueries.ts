
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
  
  // If searching, create a more effective search query
  if (searchTerm.trim() !== "") {
    const term = searchTerm.trim().toLowerCase();
    console.log("Search query created for term:", term);
    
    // Use a more flexible search that can match either email or fullName
    // In a real production app, you might want to use Firestore's array-contains-any operator
    // or a third-party search solution like Algolia for better search capabilities
    return query(
      usersCollection,
      // Remove the orderBy to allow more flexible search
      limit(100) // Increase limit to ensure we find matches
    );
  } 
  
  // For initial load, force refresh, or page navigation, get all users
  console.log("Getting all users with no search term");
  return query(
    usersCollection,
    orderBy('email'), // Order by email to make it easier to find specific emails
    limit(100) // Fetch more users to ensure we get all of them
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
