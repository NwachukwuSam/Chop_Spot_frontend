// Firebase compat SDKs are required in service worker scope (no ES modules).
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

// NOTE: env vars are unavailable in service workers — values are inlined at
// deploy time. Replace these placeholders via your CI env or build script.
// The values must match VITE_FIREBASE_* in your .env.
firebase.initializeApp({
    apiKey:            self.FIREBASE_API_KEY            || "",
    projectId:         self.FIREBASE_PROJECT_ID         || "",
    messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID || "",
    appId:             self.FIREBASE_APP_ID             || "",
});

const messaging = firebase.messaging();

// Background message handler — fires when the app is not in the foreground.
messaging.onBackgroundMessage((payload) => {
    const { title = "ChopSpot", body = "" } = payload.notification ?? {};
    self.registration.showNotification(title, {
        body,
        icon:  payload.notification?.icon  || "/logo.png",
        badge: payload.notification?.badge || "/logo.png",
        data:  payload.data || {},
    });
});
