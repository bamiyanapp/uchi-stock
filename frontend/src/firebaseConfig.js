import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDueBlD-LhxQRllxE4F1Ppjp61CN7xPvhg",
  authDomain: "my-project-6e9a3.firebaseapp.com",
  databaseURL: "https://my-project-6e9a3.firebaseio.com",
  projectId: "my-project-6e9a3",
  storageBucket: "my-project-6e9a3.firebasestorage.app",
  messagingSenderId: "69834300881",
  appId: "1:69834300881:web:1adcb0972347c00f9014f0",
  measurementId: "G-5RY3MFWJVD"
};

// Initialize Firebase only if we have what looks like real config or we are in E2E/Dev
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
