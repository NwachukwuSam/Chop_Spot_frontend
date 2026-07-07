import { useEffect, useRef, useCallback, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const NAMED_EVENTS = ["ORDER_STATUS_UPDATED", "ORDER_CONFIRMED", "NEW_ORDER", "ORDER_UPDATE"];

// Same priority order as Api.js request() so the right token is always found
const TOKEN_KEYS = ["chopspot_token", "adminToken", "accessToken", "token", "tastycart_token", "authToken", "jwt"];

// EventSource is not available in all mobile browsers (e.g. older WebViews).
const SSE_SUPPORTED = typeof EventSource !== "undefined";

function getToken() {
    for (const key of TOKEN_KEYS) {
        const val = localStorage.getItem(key);
        if (val) return val;
    }
    return null;
}

/**
 * useSse — Real-time SSE hook for ChopSpot dashboards
 *
 * Opens EventSource to /api/sse/subscribe?token=<jwt> (EventSource does not
 * support custom headers, so the token is passed as a query param for this
 * endpoint only — the backend must read it from the query string).
 *
 * Handles both generic onmessage (data JSON with a "type" field) and named
 * SSE events (event: ORDER_STATUS_UPDATED etc.) from the backend.
 *
 * Reconnects with exponential backoff: 2 s → 4 s → 8 s → … → 30 s max.
 * Reconnects immediately when the tab regains visibility and the socket is closed.
 *
 * Returns { subscribe(eventType, handler), unsubscribe(eventType), isConnected, status }
 * status: "connecting" | "connected" | "reconnecting"
 */
export function useSse({ userId, isAuthenticated }) {
    const [isConnected, setIsConnected] = useState(false);
    // "connecting" on initial mount; "connected" on open; "reconnecting" after first failure
    const [status, setStatus] = useState("connecting");

    const esRef        = useRef(null);
    const handlersRef  = useRef(new Map());   // eventType → handler fn
    const retryTimer   = useRef(null);
    const retryDelay   = useRef(2000);
    const active       = useRef(false);       // guards all async callbacks
    const connectRef   = useRef(null);        // always-fresh connect fn for retry closures

    // Assign on every render so the retry timeout always calls the latest version
    connectRef.current = function connect() {
        if (!SSE_SUPPORTED || !active.current) return;

        const token = getToken();
        if (!token) {
            console.warn("[SSE] No auth token found — skipping connection");
            return;
        }

        if (esRef.current) { esRef.current.close(); esRef.current = null; }

        const url = `${BASE_URL}/api/sse/subscribe?token=${encodeURIComponent(token)}`;
        let es;
        try { es = new EventSource(url); } catch (err) {
            console.warn("[SSE] EventSource creation failed:", err);
            return;
        }
        esRef.current = es;

        es.onopen = () => {
            if (!active.current) return;
            setIsConnected(true);
            setStatus("connected");
            retryDelay.current = 2000; // reset backoff on successful open
        };

        // Generic message handler — backend sends data: {"type":"...", ...}
        es.onmessage = (event) => {
            if (!active.current) return;
            try {
                const data = JSON.parse(event.data);
                const type = data.type || data.eventType;
                if (type) handlersRef.current.get(type)?.(data);
            } catch {}
        };

        // Named SSE events — backend sends event: ORDER_STATUS_UPDATED\ndata: {...}
        NAMED_EVENTS.forEach(type => {
            es.addEventListener(type, (event) => {
                if (!active.current) return;
                try {
                    const data = JSON.parse(event.data);
                    handlersRef.current.get(type)?.({ ...data, type });
                } catch {
                    handlersRef.current.get(type)?.({ raw: event.data, type });
                }
            });
        });

        es.onerror = () => {
            if (!active.current) return;
            setIsConnected(false);
            // Only switch to "reconnecting" after the first failure, never on initial mount
            setStatus("reconnecting");
            if (esRef.current === es) { es.close(); esRef.current = null; }

            const delay = retryDelay.current;
            retryDelay.current = Math.min(delay * 2, 30000); // cap at 30 s
            clearTimeout(retryTimer.current);
            retryTimer.current = setTimeout(() => connectRef.current?.(), delay);
        };
    };

    useEffect(() => {
        if (!SSE_SUPPORTED) return;

        active.current = !!(isAuthenticated && userId);
        retryDelay.current = 2000;
        setStatus("connecting");

        if (active.current) connectRef.current?.();

        // Reconnect immediately when the tab becomes visible and the socket is closed,
        // instead of waiting out the remaining retry interval.
        function handleVisibilityChange() {
            if (document.visibilityState === "visible" && active.current) {
                const es = esRef.current;
                if (!es || es.readyState === EventSource.CLOSED) {
                    clearTimeout(retryTimer.current);
                    connectRef.current?.();
                }
            }
        }
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            active.current = false;
            clearTimeout(retryTimer.current);
            if (esRef.current) { esRef.current.close(); esRef.current = null; }
            setIsConnected(false);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [isAuthenticated, userId]); // eslint-disable-line react-hooks/exhaustive-deps

    const subscribe   = useCallback((type, handler) => { handlersRef.current.set(type, handler); }, []);
    const unsubscribe = useCallback((type) => { handlersRef.current.delete(type); }, []);

    return { subscribe, unsubscribe, isConnected, status };
}
