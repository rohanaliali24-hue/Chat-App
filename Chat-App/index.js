
import { auth, db } from "./firebase.config.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  ref,
  push,
  set,
  remove,
  onChildAdded,
  onChildRemoved,
  onValue
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";

// HTML ELEMENTS
const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const currentUser = document.getElementById("current-user");
const logoutBtn = document.getElementById("logout-btn");
const sendBtn = document.getElementById("send-btn");
const chatError = document.getElementById("chat-error");
const usersList = document.getElementById("users-list");

// CHECK HTML ELEMENTS
if (
  !chatBox ||
  !chatForm ||
  !messageInput ||
  !currentUser ||
  !logoutBtn ||
  !sendBtn ||
  !chatError ||
  !usersList
) {
  throw new Error("HTML element missing. Check dashboard.html IDs.");
}

const messagesRef = ref(db, "messages");
const usersRef = ref(db, "users");

let loggedInUser = null;

let stopAddedListener = null;
let stopRemovedListener = null;
let stopUsersListener = null;


// AUTH CHECK
onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.replace("./login.html");
    return;
  }

  loggedInUser = user;

  const displayName =
    user.displayName || user.email || "User";

  const firstLetter =
    displayName.charAt(0).toUpperCase();

  currentUser.textContent = `Welcome, ${displayName}`;

  document.getElementById("profile-letter").textContent =
    firstLetter;

  document.getElementById("top-profile-letter").textContent =
    firstLetter;

  document.getElementById("composer-letter").textContent =
    firstLetter;

  loadMessages();
  loadUsers();

});


// LOAD ALL USERS
function loadUsers() {

  if (stopUsersListener) {
    stopUsersListener();
  }

  stopUsersListener = onValue(
    usersRef,

    (snapshot) => {

      usersList.replaceChildren();

      if (!snapshot.exists()) {
        usersList.textContent =
          "No users found in Realtime Database.";
        return;
      }

      let foundOtherUser = false;
console.log(snapshot)
      snapshot.forEach((childSnapshot) => {

        const userId = childSnapshot.key;
        const userData = childSnapshot.val() || {};

        // Current user ko list mein show nahi karna
        if (userId === loggedInUser.uid) {
          return;
        }

        const name =
          userData.name ||
          userData.displayName ||
          userData.fullName ||
          userData.username ||
          userData.email ||
          "User";

        const email = userData.email || "";

        // USER ITEM
        const item = document.createElement("div");
        item.className = "user-item";

        // USER AVATAR
        const avatar = document.createElement("div");
        avatar.className = "user-avatar";
        avatar.textContent =
          String(name).charAt(0).toUpperCase();

        // USER DETAILS
        const details = document.createElement("div");
        details.className = "user-details";

        const userName = document.createElement("strong");
        userName.textContent = name;

        details.appendChild(userName);

        if (email && email !== name) {

          const userEmail = document.createElement("small");
          userEmail.textContent = email;

          details.appendChild(userEmail);
        }

        item.append(avatar, details);

        usersList.appendChild(item);

        foundOtherUser = true;

      });

      if (!foundOtherUser) {
        usersList.textContent =
          "No other users registered yet.";
      }

    },

    (error) => {

      console.error("Users loading error:", error);

      usersList.textContent =
        "Unable to load users: " + error.message;

    }
  );

}


// LOAD MESSAGES
function loadMessages() {

  chatBox.replaceChildren();

  if (stopAddedListener) {
    stopAddedListener();
  }

  if (stopRemovedListener) {
    stopRemovedListener();
  }

  stopAddedListener = onChildAdded(
    messagesRef,

    (snapshot) => {

      const data = snapshot.val();

      if (!data || !loggedInUser) return;

      // MESSAGE MAIN DIV
      const messageDiv = document.createElement("div");

      messageDiv.className =
        data.uid === loggedInUser.uid
          ? "message sent"
          : "message received";

      messageDiv.id = "msg-" + snapshot.key;

      // MESSAGE CONTENT
      const content = document.createElement("div");
      content.className = "message-content";

      // USER NAME
      const name = document.createElement("strong");

      name.textContent =
        (data.name || "User") + ":";

      // MESSAGE TEXT
      const messageText = document.createElement("span");

      messageText.className = "message-text";
      messageText.textContent = data.message || "";

      content.append(name, messageText);

      messageDiv.appendChild(content);


      // DELETE BUTTON - ONLY OWN MESSAGE
      if (data.uid === loggedInUser.uid) {

        const deleteBox = document.createElement("div");
        deleteBox.className = "delete-button-box";

        const deleteBtn = document.createElement("button");

        deleteBtn.type = "button";
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";

        deleteBtn.addEventListener("click", async () => {

          deleteBtn.disabled = true;

          try {

            await remove(
              ref(db, "messages/" + snapshot.key)
            );

          } catch (error) {

            console.error("Delete error:", error);

            chatError.textContent =
              "Delete failed: " + error.message;

            deleteBtn.disabled = false;

          }

        });

        deleteBox.appendChild(deleteBtn);

        // Button message ke neeche add hoga
        messageDiv.appendChild(deleteBox);

      }

      chatBox.appendChild(messageDiv);

      chatBox.scrollTop = chatBox.scrollHeight;

    },

    (error) => {

      console.error("Message loading error:", error);

      chatError.textContent =
        "Unable to load messages: " + error.message;

    }
  );


  // REMOVE DELETED MESSAGES
  stopRemovedListener = onChildRemoved(
    messagesRef,

    (snapshot) => {

      const message = document.getElementById(
        "msg-" + snapshot.key
      );

      if (message) {
        message.remove();
      }

    }
  );

}


// SEND MESSAGE
chatForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  if (!loggedInUser) return;

  const message = messageInput.value.trim();

  if (!message) return;

  sendBtn.disabled = true;

  chatError.textContent = "";

  try {

    const newMessageRef = push(messagesRef);

    await set(newMessageRef, {

      uid: loggedInUser.uid,

      name:
        loggedInUser.displayName ||
        loggedInUser.email ||
        "User",

      message: message,

      createdAt: Date.now()

    });

    messageInput.value = "";

    messageInput.focus();

  } catch (error) {

    console.error("Send error:", error);

    chatError.textContent =
      "Message send failed: " + error.message;

  } finally {

    sendBtn.disabled = false;

  }

});


// LOGOUT
logoutBtn.addEventListener("click", async () => {

  logoutBtn.disabled = true;

  try {

    if (stopAddedListener) {
      stopAddedListener();
    }

    if (stopRemovedListener) {
      stopRemovedListener();
    }

    if (stopUsersListener) {
      stopUsersListener();
    }

    await signOut(auth);

    window.location.replace("./login.html");

  } catch (error) {

    console.error("Logout error:", error);

    chatError.textContent =
      "Logout failed: " + error.message;

    logoutBtn.disabled = false;

  }

});
