import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBOUd0hzsNZIhe7p-sz8PiDdwRFQLoMCOI",
  authDomain: "bap-devine.firebaseapp.com",
  projectId: "bap-devine",
  storageBucket: "bap-devine.firebasestorage.app",
  messagingSenderId: "88582221468",
  appId: "1:88582221468:android:5b9f3054a1701192f9c759",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth (Firebase JS SDK handles persistence automatically)
const auth = getAuth(app);

export { app, auth };
