import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const isE2E = import.meta.env.MODE === 'test';
const isDev = import.meta.env.MODE === 'development';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock-auth-domain",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mock-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mock-storage-bucket",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "mock-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "mock-app-id"
};

// Initialize Firebase only if we have what looks like real config or we are in E2E/Dev
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
