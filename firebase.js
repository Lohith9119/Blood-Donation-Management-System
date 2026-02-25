// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsEx6ky2r_Olvc-jHI3pgiNMYzTgaieRQ",
  authDomain: "bllood-donation.firebaseapp.com",
  projectId: "bllood-donation",
  storageBucket: "bllood-donation.firebasestorage.app",
  messagingSenderId: "394803049065",
  appId: "1:394803049065:web:22747f252101206795e8f8",
  measurementId: "G-H667BMY80T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("🔥 Firebase initialized successfully!");
console.log("Project: bllood-donation");

export default app;