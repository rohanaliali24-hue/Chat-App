
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDc7mHWi4NZYP6V_XHIMbicbaSJWUBmdYI",
    authDomain: "chat-app-8fa9d.firebaseapp.com",
    databaseURL: "https://chat-app-8fa9d-default-rtdb.firebaseio.com",
    projectId: "chat-app-8fa9d",
    storageBucket: "chat-app-8fa9d.firebasestorage.app",
    messagingSenderId: "402289378206",
    appId: "1:402289378206:web:f16f60781b047af38c0c8f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
export const auth = getAuth(app);

// Initialize Realtime Database
export const db = getDatabase(app);
