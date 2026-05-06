import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
 apiKey: "AIzaSyAVlaZ6fAs8vvboX-sA_Sm3QLPOzsCwjcY",
  authDomain: "ajedrezneuraldb.firebaseapp.com",
  projectId: "ajedrezneuraldb",
  storageBucket: "ajedrezneuraldb.firebasestorage.app",
  messagingSenderId: "877661261225",
  appId: "1:877661261225:web:a456cfeed463644e5a08b8"
};

// 🔥 TRUCO ANTI-ZOMBIE: Creamos una app con un nombre específico ("AjedrezV2"). 
// Así obligamos a Firebase a ignorar la llave vieja que pueda estar atascada en la memoria.
const nombreApp = "AjedrezV2";
const app = getApps().find(a => a.name === nombreApp) || initializeApp(firebaseConfig, nombreApp);

export const db = getFirestore(app);
export const auth = getAuth(app);