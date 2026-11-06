import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  push, 
  remove, 
  update, 
  onValue, 
  off 
} from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCL6BaGRq5UC8fotKOM2UDd9m-BDXuOREY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "rahul-passmanager.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://rahul-passmanager-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "rahul-passmanager",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "rahul-passmanager.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "969534574835",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:969534574835:web:99f436b20eced8aaa62786",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-NQ18FHHCQL"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  ref,
  set,
  get,
  push,
  remove,
  update,
  onValue,
  off
};

