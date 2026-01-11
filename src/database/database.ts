import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configurações do seu projeto (Suas chaves reais)
const firebaseConfig = {
  apiKey: "AIzaSyAnRyEojMCLgSq4CrhKz0scxkkw4o5Fv8E",
  authDomain: "crediarioapp.firebaseapp.com",
  projectId: "crediarioapp",
  storageBucket: "crediarioapp.firebasestorage.app",
  messagingSenderId: "915934698752",
  appId: "1:915934698752:web:24779abe2143683aca27e5"
};

// 1. Inicia a conexão com o Google
const app = initializeApp(firebaseConfig);

// 2. Exporta o banco de dados (Firestore) para usar nas telas
const db = getFirestore(app);

// Exportação simples (resolve o erro do index.tsx)
export { db };
