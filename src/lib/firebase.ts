import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App safely (checking if it has already been initialized to prevent hot-reload duplicates)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/**
 * Safely initializes and returns Firebase Analytics in a client-side context.
 * Resolves to null on server-side pre-rendering or if the user's browser blocks analytics tracking.
 */
export const initAnalytics = async () => {
  if (typeof window !== "undefined") {
    // Check if the current browser environment supports Google Firebase Analytics
    const supported = await isSupported();
    if (supported) {
      return getAnalytics(app);
    }
  }
  return null;
};
