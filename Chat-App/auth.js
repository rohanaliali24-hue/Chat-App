
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import {
  ref,
  set,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js";
import { auth, db } from "./firebase.config.js";

// SIGNUP
const registerForm = document.getElementById("register-form");

if (registerForm) {

    registerForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name = document.getElementById("register-name").value.trim();
        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value;

        const message = document.getElementById("signup-message");
        const button = document.getElementById("signup-btn");

        if (name.length < 2) {
            message.textContent = "Please enter your full name.";
            return;
        }

        button.disabled = true;
        message.textContent = "Creating account...";

        try {

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );
debugger
            // Save registered user in Firebase Realtime Database
            await set(ref(db, `users/${userCredential.user.uid}`), {
                uid: userCredential.user.uid,
                name: name,
                email: email,
            });

            await updateProfile(userCredential.user, {
                displayName: name
            });

            window.location.replace("./index.html");

        } catch (error) {

            console.error(error);
            message.textContent = error.message;

        } finally {

            button.disabled = false;

        }

    });

}

// LOGIN
const loginForm = document.getElementById("login-form");

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;

        const message = document.getElementById("login-message");
        const button = document.getElementById("login-btn");

        button.disabled = true;
        message.textContent = "Logging in...";

        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            window.location.replace("./index.html");

        } catch (error) {

            console.error(error);
            message.textContent = error.message;

        } finally {

            button.disabled = false;

        }

    });

}