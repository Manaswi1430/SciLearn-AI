import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

console.log('[FirebaseConfig] Loading environment variables:');
console.log(' - projectId:', firebaseConfig.projectId || 'MISSING');
console.log(' - authDomain:', firebaseConfig.authDomain || 'MISSING');
console.log(' - apiKey:', firebaseConfig.apiKey ? `${firebaseConfig.apiKey.slice(0, 6)}...${firebaseConfig.apiKey.slice(-4)}` : 'MISSING');
console.log(' - appId:', firebaseConfig.appId || 'MISSING');

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('[FirebaseConfig] Firebase app successfully initialized.');
} catch (error) {
  console.error('[FirebaseConfig] Failed to initialize Firebase app:', error);
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log('[FirebaseConfig] Auth initialization status:', auth ? 'INITIALIZED' : 'FAILED');
console.log('[FirebaseConfig] Firestore initialization status:', db ? 'INITIALIZED' : 'FAILED');

export default app;
