import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// Firebase web config is public client configuration. Access is controlled by Auth and Firestore rules.
const firebaseConfig = {
  apiKey: "AIzaSyAnW6B3CEoFEQy08WFGKIfNVzs3TevBPtc",
  authDomain: "amen-app-b0da2.firebaseapp.com",
  projectId: "amen-app-b0da2",
  storageBucket: "amen-app-b0da2.firebasestorage.app",
  messagingSenderId: "964550407508",
  appId: "1:964550407508:web:2d6a8c18fcf461af97c4c1"
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

enableIndexedDbPersistence(db).catch((error) => {
  if (error.code !== 'failed-precondition' && error.code !== 'unimplemented') {
    console.warn('Не удалось включить офлайн-режим Firestore:', error);
  }
});
