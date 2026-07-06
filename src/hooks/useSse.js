import { useEffect, useRef, useCallback, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const NAMED_EVENTS = ["ORDER_STATUS_UPDATED", "ORDER_CONFIRMED", "NEW_ORDER", "ORDER_UPDATE"];

function getToken() {
    return localStorage.getItem("chopspot_token") || localStorage.getItem("token") || null;
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
 * Reconnects with exponential backoff: 5 s → 10 s → 20 s → 30 s max.
 *
 * Returns { subscribe(eventType, handler), unsubscribe(eventType), isConnected }
 */
export function useSse({ userId, isAuthenticated }) {
    const [isConnected, setIsConnected] = useState(false);

    const esRef       = useRef(null);
    const handlersRef = useRef(new Map());   // eventType → handler fn
    const retryTimer  = useRef(null);
    const retryDelay  = useRef(5000);
    const active      = useRef(false);       // guards all async callbacks
    const connectRef  = useRef(null);        // always-fresh connect fn for retry closures

    // Assign on every render so the retry timeout always calls the latest version
    connectRef.current = function connect() {
        if (!active.current) return;

        const token = getToken();
        if (!token) return;

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
            retryDelay.current = 5000; // reset backoff on successful open
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
            if (esRef.current === es) { es.close(); esRef.current = null; }

            const delay = retryDelay.current;
            retryDelay.current = Math.min(delay * 2, 30000); // cap at 30 s
            clearTimeout(retryTimer.current);
            retryTimer.current = setTimeout(() => connectRef.current?.(), delay);
        };
    };

    useEffect(() => {
        active.current = !!(isAuthenticated && userId);
        retryDelay.current = 5000;

        if (active.current) connectRef.current?.();

        return () => {
            active.current = false;
            clearTimeout(retryTimer.current);
            if (esRef.current) { esRef.current.close(); esRef.current = null; }
            setIsConnected(false);
        };
    }, [isAuthenticated, userId]); // eslint-disable-line react-hooks/exhaustive-deps

    const subscribe   = useCallback((type, handler) => { handlersRef.current.set(type, handler); }, []);
    const unsubscribe = useCallback((type) => { handlersRef.current.delete(type); }, []);

    return { subscribe, unsubscribe, isConnected };
}
