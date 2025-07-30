import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB8H3b1n1idpqbnt26OQoMIX_iKGa52dZg",
  authDomain: "tawkify-4f5a9.firebaseapp.com",
  projectId: "tawkify-4f5a9",
  storageBucket: "tawkify-4f5a9.firebasestorage.app",
  messagingSenderId: "203095260196",
  appId: "1:203095260196:web:c6805571c5873d60abacb1",
  measurementId: "G-6FPHW2N2B8",
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
