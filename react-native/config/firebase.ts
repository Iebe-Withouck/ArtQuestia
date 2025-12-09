import { initializeApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';

// Firebase will auto-initialize using the GoogleService-Info.plist (iOS) 
// and google-services.json (Android) files
// This file ensures Firebase is ready before the app renders

const app = initializeApp();
const auth = getAuth(app);

export { app, auth };
