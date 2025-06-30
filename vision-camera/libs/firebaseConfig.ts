// lib/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCd38Gda9NZl2QitMt8DkX3BzhglKXgAIM',
  authDomain: 'fallen-falldetection.firebaseapp.com',
  projectId: 'fallen-falldetection',
  storageBucket: 'fallen-falldetection.firebasestorage.app', 
  messagingSenderId: '896516601726',
  appId: '1:896516601726:android:2bbf8822d895d0a210e52f',
};

const app = initializeApp(firebaseConfig);

// ✅ especificamos el bucket real manualmente con "gs://"
export const storage = getStorage(app, 'gs://fallen-falldetection.firebasestorage.app');

