import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

// Configuration provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyABivpUnWm-up2oGzPPDJi8dXHz88bk2ho",
  authDomain: "mcmplus-9f406.firebaseapp.com",
  projectId: "mcmplus-9f406",
  storageBucket: "mcmplus-9f406.firebasestorage.app",
  messagingSenderId: "750049930482",
  appId: "1:750049930482:web:5ad5854815c881abd6746b"
};

// Initialize Firebase
// Check if apps are already initialized to avoid errors in hot-reload environments
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

export const auth = app.auth();
export const db = app.firestore();
export const storage = app.storage();