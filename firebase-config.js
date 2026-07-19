import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, query, where, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// TODO: Replace this with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3XHj9fxbvJq5CXgcd-lN0-7xjJY43e3A",
  authDomain: "love-74e38.firebaseapp.com",
  projectId: "love-74e38",
  storageBucket: "love-74e38.firebasestorage.ap",
  messagingSenderId: "662180025977",
  appId: "1:662180025977:web:d07f76ba90f0fa4bac66a8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage, collection, addDoc, getDocs, doc, getDoc, query, where, updateDoc, serverTimestamp, ref, uploadBytes, getDownloadURL };
