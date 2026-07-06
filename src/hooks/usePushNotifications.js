import { useState, useEffect, useRef, useCallback } from "react";
import { messaging, getToken, onMessage } from "../firebase";
import { useToast } from "../context/ToastContext";

const VAPID_KEY   = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const API_BASE    = import.meta.env.VITE_API_BASE_URL;
const STORAGE_KEY = "chopspot_fcm_token";

// Evaluated once at module load — safe to use as a constant inside hooks.
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

    // Guard Notification.permission access — the global may not exist on this browser.
    const [notificationsEnabled, setNotificationsEnabled] = useState(
        () => SUPPORTED && Notification.permission === "granted"
    );
    const unsubscribeRef = useRef(null);

    // Foreground message listener. All hooks are called unconditionally;
    // the feature guard lives inside the effect body.
    useEffect(() => {
        if (!SUPPORTED || !messaging) return;

        try {
            const unsub = onMessage(messaging, (payload) => {
                const title = payload.notification?.title || "ChopSpot";
                const body  = payload.notification?.body  || "";
                toast.info(`${title}: ${body}`, 7000);
            });
            unsubscribeRef.current = unsub;
            return () => unsub();
        } catch (err) {
            console.warn("[FCM] onMessage setup failed:", err);
        }
    }, [toast]);

    const requestPermission = useCallback(async () => {
        if (!SUPPORTED || !messaging || !VAPID_KEY) return;

        try {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") return;

            const swReg = await navigator.serviceWorker.register(
                "/firebase-messaging-sw.js",
                { scope: "/" }
            );

            const currentToken = await getToken(messaging, {
                vapidKey:                   VAPID_KEY,
                serviceWorkerRegistration:  swReg,
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
    }, []);

    return { notificationsEnabled, requestPermission };
}
