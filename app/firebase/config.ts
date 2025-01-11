import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBD4ELBKQT-jQ2Dh65L49_gZ-TBYTh-OOQ",
  authDomain: "condoindica.firebaseapp.com",
  projectId: "condoindica",
  storageBucket: "condoindica.firebasestorage.app", // Corrigido o valor do storageBucket
  messagingSenderId: "853154940191",
  appId: "1:853154940191:web:2dc21d88c27bf8fb4adc2a"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

