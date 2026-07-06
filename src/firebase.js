import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:        `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// App init is synchronous and must happen at module level.
// Guard against HMR double-init and missing config values.
let _app = null;
try {
    _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (err) {
    console.warn("[Firebase] App initialization failed — push notifications disabled:", err);
}

/**
 * Lazily resolves the messaging instance after an async isSupported() check.
 * Returns null on any unsupported browser (e.g. Mobile Safari without SW support).
 * Safe to call multiple times — Firebase deduplicates the messaging instance.
 */
export async function getMessagingInstance() {
    if (!_app) return null;
    try {
        const supported = await isSupported();
        if (!supported) return null;
        return getMessaging(_app);
    } catch (err) {
        console.warn("[Firebase] getMessaging failed:", err);
        return null;
    }
}

export { getToken, onMessage };
