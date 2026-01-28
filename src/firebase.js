import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCI9AH2vtxc9IhHdQBzA_5QPJDF5p-OTUE",
  authDomain: "tunas-craft.firebaseapp.com",
  projectId: "tunas-craft",
  storageBucket: "tunas-craft.appspot.com",
  messagingSenderId: "805844799800",
  appId: "1:805844799800:web:8c3332ee01c3c4f9c1f1cd",
  measurementId: "G-BMF86Q9D45"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
