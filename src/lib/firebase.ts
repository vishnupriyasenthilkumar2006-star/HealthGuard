import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCa-Szy9qkseAcH0BzTCOKMyhkITym_rls",
  authDomain: "mediminder-4e87b.firebaseapp.com",
  projectId: "mediminder-4e87b",
  storageBucket: "mediminder-4e87b.firebasestorage.app",
  messagingSenderId: "268268431217",
  appId: "1:268268431217:web:89fb2702e059d3dcedf8d0",
  measurementId: "G-YHD61YZNVH",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
