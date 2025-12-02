import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);