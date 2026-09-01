// firebase-config.js
// Firebase Configuration for GitHub Pages Deployment
// Last updated: September 1, 2026

// ======================================================
// IMPORTANT: For GitHub Pages to work correctly,
// we must use classic script loading instead of ES6 modules
// ======================================================

// ======================================================
// FIREBASE CONFIGURATION
// WARNING: Replace with your actual Firebase project credentials
// Get these from: Firebase Console > Project Settings > General > Your apps
// ======================================================

const firebaseConfig = {
  apiKey: "AIzaSyC_9K6OnkCwGkF9UuCJ4N2i2qN8dXtYvBg", // <-- REPLACE WITH YOUR REAL API KEY
  authDomain: "rongkhem-rice-group.firebaseapp.com",
  projectId: "rongkhem-rice-group",
  storageBucket: "rongkhem-rice-group.firebasestorage.app",
  messagingSenderId: "114954787725",
  appId: "1:114954787725:web:d18bb54ac53bc00db17bc4",
  measurementId: "G-70Z00XXB8Y"
};

// ======================================================
// INITIALIZE FIREBASE
// ======================================================

// Initialize Firebase only if it hasn't been initialized
let app, auth, db, storage;

try {
  // Check if Firebase is already loaded
  if (typeof firebase === 'undefined') {
    console.error("Firebase SDK not loaded! Make sure firebase-app.js is loaded first.");
  } else {
    // Initialize Firebase App
    app = firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully!");
    
    // Initialize Authentication
    auth = firebase.auth();
    
    // Initialize Firestore Database
    db = firebase.firestore();
    
    // Initialize Cloud Storage
    storage = firebase.storage();
    
    // Optional: Enable Firestore persistence (works offline)
    db.enablePersistence()
      .catch((err) => {
        console.warn("Firestore persistence not enabled:", err.code);
      });
      
    // Optional: Set Firestore settings for better performance
    db.settings({
      cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
    });
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  
  // Check specific errors
  if (error.code === 'app/duplicate-app') {
    console.warn("Firebase app already initialized, using existing app.");
    app = firebase.app();
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
  }
}

// ======================================================
// FIREBASE UTILITY FUNCTIONS
// ======================================================

/**
 * Check if user is logged in
 * @returns {boolean} True if user is authenticated
 */
function isUserLoggedIn() {
  return auth && auth.currentUser !== null;
}

/**
 * Get current user ID
 * @returns {string|null} User ID or null if not logged in
 */
function getCurrentUserId() {
  return auth && auth.currentUser ? auth.currentUser.uid : null;
}

/**
 * Get current user email
 * @returns {string|null} User email or null if not logged in
 */
function getCurrentUserEmail() {
  return auth && auth.currentUser ? auth.currentUser.email : null;
}

/**
 * Check if user is admin
 * Note: You need to implement your own admin check logic
 * This is just a template - modify based on your user database
 */
async function isUserAdmin() {
  if (!isUserLoggedIn()) return false;
  
  try {
    const userId = getCurrentUserId();
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      return userData.role === 'admin' || userData.isAdmin === true;
    }
    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// ======================================================
// ERROR HANDLING
// ======================================================

// Listen for auth state changes
if (auth) {
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("User logged in:", user.email);
      
      // You can add additional actions here when user logs in
      // Example: Update UI, redirect, etc.
    } else {
      console.log("User logged out");
      
      // You can add additional actions here when user logs out
      // Example: Redirect to login page
    }
  }, (error) => {
    console.error("Auth state change error:", error);
  });
}

// ======================================================
// MAKE VARIABLES AVAILABLE GLOBALLY
// WARNING: Be careful with global variables in production
// ======================================================

// For GitHub Pages compatibility, we need global variables
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;
window.firebaseStorage = storage;

// Convenience variables (shorter names)
window.auth = auth;
window.db = db;
window.storage = storage;

// Utility functions
window.isUserLoggedIn = isUserLoggedIn;
window.getCurrentUserId = getCurrentUserId;
window.getCurrentUserEmail = getCurrentUserEmail;
window.isUserAdmin = isUserAdmin;

// ======================================================
// DEBUG HELPER
// ======================================================

/**
 * Display Firebase status in console
 */
function showFirebaseStatus() {
  console.group("🔥 Firebase Status");
  console.log("App initialized:", !!app);
  console.log("Auth available:", !!auth);
  console.log("Firestore available:", !!db);
  console.log("Storage available:", !!storage);
  console.log("User logged in:", isUserLoggedIn());
  if (isUserLoggedIn()) {
    console.log("User email:", getCurrentUserEmail());
  }
  console.groupEnd();
}

// Show status when page loads (in development)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.addEventListener('load', () => {
    setTimeout(showFirebaseStatus, 1000);
  });
}

// ======================================================
// INITIALIZATION CHECK
// ======================================================

// Check if Firebase initialized properly after 2 seconds
setTimeout(() => {
  if (!app) {
    console.error("❌ Firebase failed to initialize!");
    console.error("Possible reasons:");
    console.error("1. Firebase SDK not loaded before this file");
    console.error("2. Invalid Firebase configuration");
    console.error("3. Network issues loading Firebase SDK");
    
    // You might want to show a user-friendly message
    if (typeof document !== 'undefined') {
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #ff6b6b;
        color: white;
        padding: 10px;
        border-radius: 5px;
        z-index: 9999;
      `;
      errorDiv.textContent = "⚠️ ระบบฐานข้อมูลไม่สามารถเชื่อมต่อได้ กรุณารีเฟรชหน้าเว็บ";
      document.body.appendChild(errorDiv);
    }
  }
}, 2000);

// ======================================================
// EXPORT FOR MODULE USERS (Optional)
// Only works if loaded as module - not for GitHub Pages
// ======================================================

try {
  // Try to export for ES6 modules (won't work in GitHub Pages)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      app,
      auth,
      db,
      storage,
      isUserLoggedIn,
      getCurrentUserId,
      getCurrentUserEmail,
      isUserAdmin,
      firebaseConfig
    };
  }
} catch (e) {
  // Ignore module export errors for GitHub Pages
}
