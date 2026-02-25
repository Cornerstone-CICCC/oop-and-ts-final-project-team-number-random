import { initializeApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import type { Auth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

// Firebase configuration for emulator
// When using Firebase Emulator with 'demo-' prefix project ID,
// real Firebase credentials are not required
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-kanban.firebaseapp.com",
  projectId: "demo-kanban",
};

// Initialize Firebase app
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth: Auth = getAuth(app);

// Initialize Firestore
const db: Firestore = getFirestore(app);

// Emulator connection settings
const EMULATOR_HOST = "localhost";
const AUTH_EMULATOR_PORT = 9099;
const FIRESTORE_EMULATOR_PORT = 8080;

/**
 * Connect to Firebase Emulators
 * This should be called once when the app starts in development mode
 */
export function connectToEmulators(): void {
  try {
    // Connect to Auth Emulator
    connectAuthEmulator(auth, `http://${EMULATOR_HOST}:${AUTH_EMULATOR_PORT}`, {
      disableWarnings: true,
    });

    // Connect to Firestore Emulator
    connectFirestoreEmulator(db, EMULATOR_HOST, FIRESTORE_EMULATOR_PORT);
  } catch (error) {
    console.warn("Firebase Emulator connection warning:", error);
  }
}

// Auto-connect to emulators in development mode
if (import.meta.env.DEV) {
  connectToEmulators();
}

export { app, auth, db };
