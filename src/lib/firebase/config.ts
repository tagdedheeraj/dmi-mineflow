
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4IE8x5PdQKEF3hCD3k5A1LMDl5cZOd70",
  authDomain: "dmi-network.firebaseapp.com",
  projectId: "dmi-network",
  storageBucket: "dmi-network.appspot.com",
  messagingSenderId: "836476789960",
  appId: "1:836476789960:web:6754c3a441a9243d9bf1fd",
  measurementId: "G-F0597683MK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Export the Firebase services
export { app, auth, analytics, db };
