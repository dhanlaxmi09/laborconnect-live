import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCQBu6-viTnCGjUxCHJpSFma4BByDcXbwU",
  authDomain: "labourconnectapp.firebaseapp.com",
  projectId: "labourconnectapp",
  storageBucket: "labourconnectapp.firebasestorage.app",
  messagingSenderId: "687385573506",
  appId: "1:687385573506:web:ef55bf38cc1049de09dc9b",
  measurementId: "G-5F5FYKFGBE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
