import { useState, useEffect, useCallback } from "react";
import { getMessagingInstance, getToken, onMessage } from "../firebase";
import { useToast } from "../context/ToastContext";

const VAPID_KEY   = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const API_BASE    = import.meta.env.VITE_API_BASE_URL;
const STORAGE_KEY = "chopspot_fcm_token";

// Evaluated once at module load — avoids touching Notification inside a hook.
const SUPPORTED =
    typeof Notification !== "undefined" &&
    "serviceWorker" in navigator;

async function registerTokenWithBackend(fcmToken) {
    const authToken =
        localStorage.getItem("chopspot_token") ||
        localStorage.getItem("adminToken")     ||
        localStorage.getItem("token");
    if (!authToken) return;

    await fetch(`${API_BASE}/api/fcm/register`, {
        method:  "POST",
        headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({ token: fcmToken, deviceType: "WEB" }),
    });
}

export default function usePushNotifications() {
    const toast = useToast();

    const [notificationsEnabled, setNotificationsEnabled] = useState(
        () => SUPPORTED && Notification.permission === "granted"
    );
    // Resolved lazily via getMessagingInstance() — null until isSupported() resolves.
    const [msgInstance, setMsgInstance] = useState(null);

    // Resolve the messaging instance once on mount.
    // getMessagingInstance() runs isSupported() before calling getMessaging(),
    // so this is safe on any browser including those without SW support.
    useEffect(() => {
        if (!SUPPORTED) return;
        getMessagingInstance()
            .then(m => { if (m) setMsgInstance(m); })
            .catch(err => console.warn("[FCM] getMessagingInstance failed:", err));
    }, []);

    // Foreground message listener — wired up once msgInstance is resolved.
    useEffect(() => {
        if (!msgInstance) return;
        try {
            const unsub = onMessage(msgInstance, (payload) => {
                const title = payload.notification?.title || "ChopSpot";
                const body  = payload.notification?.body  || "";
                toast.info(`${title}: ${body}`, 7000);
            });
            return () => unsub();
        } catch (err) {
            console.warn("[FCM] onMessage setup failed:", err);
        }
    }, [msgInstance, toast]);

    const requestPermission = useCallback(async () => {
        if (!SUPPORTED || !msgInstance || !VAPID_KEY) return;

        try {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") return;

            const swReg = await navigator.serviceWorker.register(
                "/firebase-messaging-sw.js",
                { scope: "/" }
            );

            const currentToken = await getToken(msgInstance, {
                vapidKey:                  VAPID_KEY,
                serviceWorkerRegistration: swReg,
            });

            if (!currentToken) return;

            const cached = localStorage.getItem(STORAGE_KEY);
            if (cached !== currentToken) {
                await registerTokenWithBackend(currentToken);
                localStorage.setItem(STORAGE_KEY, currentToken);
            }

            setNotificationsEnabled(true);
        } catch (err) {
            console.warn("[FCM] Token registration failed:", err);
        }
    }, [msgInstance]);

    return { notificationsEnabled, requestPermission };
}
