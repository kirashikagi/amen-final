import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC13LrL4yNE4F8ekrZQnhdvgzhkfnVaR_w",
  authDomain: "amen-7e4fa.firebaseapp.com",
  projectId: "amen-7e4fa",
  storageBucket: "amen-7e4fa.firebasestorage.app",
  messagingSenderId: "1082048216180",
  appId: "1:1082048216180:web:cc5e252e70153f1c332521"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);