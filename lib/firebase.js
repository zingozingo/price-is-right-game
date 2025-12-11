import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyD7H1_ZzYKN_cmZrkbE__6D-NLi-e2eORc",
  authDomain: "holiday-game.firebaseapp.com",
  databaseURL: "https://holiday-game-default-rtdb.firebaseio.com",
  projectId: "holiday-game",
  storageBucket: "holiday-game.firebasestorage.app",
  messagingSenderId: "505137047270",
  appId: "1:505137047270:web:cf9839dc12266a6c8dfd27"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);