// Centralized Firebase Initialization
// Import this module in all pages to avoid duplicate initializations

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyC2YE5Cn0gbiuQ5sq8lErotl01itq5-hYk",
  authDomain: "titans-8d454.firebaseapp.com",
  projectId: "titans-8d454",
  storageBucket: "titans-8d454.firebasestorage.app",
  messagingSenderId: "537648978979",
  appId: "1:537648978979:web:30eb90af77c7569b7be596",
  measurementId: "G-W1D2R0Q1L1",
  databaseURL: "https://titans-8d454-default-rtdb.firebaseio.com"
};

// Initialize Firebase only once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app, "https://titans-8d454-default-rtdb.firebaseio.com");

// Export for use in other modules
export { app, auth, db, rtdb };

