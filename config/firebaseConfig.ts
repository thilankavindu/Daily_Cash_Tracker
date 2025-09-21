// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore' 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_Nwt3mRAb710loiMw7LmYvblp91vDmJ0",
  authDomain: "cashtracker-12304.firebaseapp.com",
  projectId: "cashtracker-12304",
  storageBucket: "cashtracker-12304.firebasestorage.app",
  messagingSenderId: "118950351113",
  appId: "1:118950351113:web:08c19080bc71d5860ec3d8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);   

export { auth, db };