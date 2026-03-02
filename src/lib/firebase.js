import { initializeApp } from 'firebase/app';
import { getFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';

// Ваши ключи
const firebaseConfig = { /* ... */ };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Врубаем оффлайн-персистентность
enableMultiTabIndexedDbPersistence(db)
  .then(() => console.log('Оффлайн кэш активирован'))
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Кэш работает только в одной вкладке');
    } else if (err.code === 'unimplemented') {
      console.warn('Браузер не поддерживает оффлайн-базу');
    }
  });
