// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFW-KxpsblxwgePeGD1tOCUOGA-5XyxDg",
  authDomain: "hotel-qr-ordering-61910.firebaseapp.com",
  projectId: "hotel-qr-ordering-61910",
  storageBucket: "hotel-qr-ordering-61910.firebasestorage.app",
  messagingSenderId: "921453744699",
  appId: "1:921453744699:web:c3c3bbad623b3172e8821e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);