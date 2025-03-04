import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCfS11_Vh6YQxueYOjlhHOtL-y-_aAmxU8",
  authDomain: "text-sharing-app-c95bf.firebaseapp.com",
  projectId: "text-sharing-app-c95bf",
  storageBucket: "text-sharing-app-c95bf.firebasestorage.app",
  messagingSenderId: "463183195915",
  appId: "1:463183195915:web:5124f310479180f2c3fc0e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 