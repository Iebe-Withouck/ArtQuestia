import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { app, auth };
