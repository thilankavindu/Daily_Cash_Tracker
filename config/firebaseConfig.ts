// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore' 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmnZIldQJbJV3rr85kVfgUnSXyudE4GPI",
  authDomain: "cashtracker-43486.firebaseapp.com",
  projectId: "cashtracker-43486",
  storageBucket: "cashtracker-43486.firebasestorage.app",
  messagingSenderId: "518802998206",
  appId: "1:518802998206:web:bd0e1a1942abf26bb52fef",
  measurementId: "G-W1TYD27JL7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);   

export { auth, db };