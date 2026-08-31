// firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

import {
  getStorage
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";


// ======================================================
// FIREBASE CONFIG
// ======================================================
// ⚠️ เปลี่ยนค่าด้านล่างเป็นค่าจริงจาก Firebase Console
// ======================================================

const firebaseConfig = {

  apiKey: "YOUR_API_KEY",

  authDomain: "YOUR_PROJECT.firebaseapp.com",

  projectId: "YOUR_PROJECT_ID",

  storageBucket: "YOUR_PROJECT.appspot.com",

  messagingSenderId: "YOUR_SENDER_ID",

  appId: "YOUR_APP_ID"

};


// ======================================================
// INITIALIZE FIREBASE
// ======================================================

const app = initializeApp(firebaseConfig);


// ======================================================
// FIREBASE AUTHENTICATION
// ======================================================

export const auth = getAuth(app);


// ======================================================
// FIRESTORE DATABASE
// ======================================================

export const db = getFirestore(app);


// ======================================================
// FIREBASE STORAGE
// ======================================================

export const storage = getStorage(app);


// ======================================================
// EXPORT APP
// ======================================================

export { app };
