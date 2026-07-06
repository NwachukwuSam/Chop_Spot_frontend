import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

let messaging = null;

try {
    const firebaseConfig = {
        apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain:        `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
        projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId:             import.meta.env.VITE_FIREBASE_APP_ID,
    };

    // initializeApp throws if config values are missing or malformed.
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
} catch (err) {
    console.warn("[Firebase] Initialization failed — push notifications disabled:", err);
}

export { messaging, getToken, onMessage };
