// app/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDCX2liHf5Dz22pXwETlhhcNdxKM86RGds",
  authDomain: "pawconnect-9dcfc.firebaseapp.com",
  projectId: "pawconnect-9dcfc",
  storageBucket: "pawconnect-9dcfc.firebasestorage.app",
  messagingSenderId: "1382866926",
  appId: "1:1382866926:web:ca742b2670effefabb38ff"
};

const app = initializeApp(firebaseConfig);

// ¡IMPORTANTE! Asegúrate de que tengan la palabra 'export' adelante
export const db = getFirestore(app); 
export const auth = getAuth(app);