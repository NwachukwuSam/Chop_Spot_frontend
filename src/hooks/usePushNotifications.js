import { useState, useEffect, useRef, useCallback } from "react";
import { messaging, getToken, onMessage } from "../firebase";
import { useToast } from "../context/ToastContext";

const VAPID_KEY      = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const API_BASE       = import.meta.env.VITE_API_BASE_URL;
const STORAGE_KEY    = "chopspot_fcm_token";

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
        () => Notification.permission === "granted"
    );
    const unsubscribeRef = useRef(null);

    // Set up foreground message listener once messaging is available.
    useEffect(() => {
        if (!messaging) return;

        const unsub = onMessage(messaging, (payload) => {
            const title = payload.notification?.title || "ChopSpot";
            const body  = payload.notification?.body  || "";
            toast.info(`${title}: ${body}`, 7000);
        });

        unsubscribeRef.current = unsub;
        return () => unsub();
    }, [toast]);

    const requestPermission = useCallback(async () => {
        if (!messaging || !VAPID_KEY) return;

        try {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") return;

            const currentToken = await getToken(messaging, {
                vapidKey:           VAPID_KEY,
                serviceWorkerRegistration: await navigator.serviceWorker.register(
                    "/firebase-messaging-sw.js",
                    { scope: "/" }
                ),
            });

            if (!currentToken) return;

            // Skip registration if the token hasn't changed since last time.
            const cached = localStorage.getItem(STORAGE_KEY);
            if (cached !== currentToken) {
                await registerTokenWithBackend(currentToken);
                localStorage.setItem(STORAGE_KEY, currentToken);
            }

            setNotificationsEnabled(true);
        } catch (err) {
            console.warn("FCM token error:", err);
        }
    }, []);

    return { notificationsEnabled, requestPermission };
}
