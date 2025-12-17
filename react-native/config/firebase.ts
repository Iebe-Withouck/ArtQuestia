import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBOUd0hzsNZIhe7p-sz8PiDdwRFQLoMCOI",
  authDomain: "bap-devine.firebaseapp.com",
  projectId: "bap-devine",
  storageBucket: "bap-devine.firebasestorage.app",
  messagingSenderId: "88582221468",
  appId: "1:88582221468:android:5b9f3054a1701192f9c759",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { app, auth };
