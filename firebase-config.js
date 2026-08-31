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

const firebaseConfig = {
  apiKey: "AIzaSyCme8E32QPySbSetpZP9_yAyiHpSGmlxlc",
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

const app = initializeApp(firebaseConfig);


// ======================================================
// AUTHENTICATION
// ======================================================

const auth = getAuth(app);


// ======================================================
// FIRESTORE
// ======================================================

const db = getFirestore(app);


// ======================================================
// STORAGE
// ======================================================

const storage = getStorage(app);


// ======================================================
// EXPORT
// ======================================================

export {
  app,
  auth,
  db,
  storage
};
