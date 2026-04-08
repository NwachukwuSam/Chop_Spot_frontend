/**
 * DeliveryMap.jsx
 *
 * Leaflet/OpenStreetMap component used in two places:
 *
 *  MODE "checkout"  — inside CheckoutModal
 *    • Draggable green pin at the geocoded delivery location
 *    • Orange restaurant pin (if restaurantCoords provided)
 *    • Dashed line between them
 *    • onPinMoved called with { lat, lng } when user drags the pin
 *
 *  MODE "tracking"  — inside OrderDetailModal
 *    • Read-only: restaurant pin + customer pin + optional rider pin
 *    • Dashed route line through all present pins
 *
 * IMPORTANT: This component is coordinate-agnostic.
 * All { lat, lng } values come from the parent via props.
 * Geocoding is done by the parent using useGeocoder — never here.
 *
 * SETUP: Add to your index.html <head>:
 *   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
 * (The JS is loaded on demand — no extra script tag needed.)
 */

import { useEffect, useRef, useState } from "react";

// ── Leaflet loader (CDN, loads once per page) ─────────────────────────────────
let leafletLoaded  = false;
let leafletPromise = null;

function loadLeaflet() {
    if (leafletLoaded && window.L) return Promise.resolve(window.L);
    if (leafletPromise)            return leafletPromise;

    leafletPromise = new Promise((resolve, reject) => {
        if (!document.getElementById("leaflet-css")) {
            const link = document.createElement("link");
            link.id    = "leaflet-css";
            link.rel   = "stylesheet";
            link.href  = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);
        }
        if (window.L) { leafletLoaded = true; resolve(window.L); return; }

        const s   = document.createElement("script");
        s.src     = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        s.onload  = () => { leafletLoaded = true; resolve(window.L); };
        s.onerror = () => reject(new Error("Failed to load Leaflet"));
        document.head.appendChild(s);
    });

    return leafletPromise;
}

// ── Teardrop pin icon ─────────────────────────────────────────────────────────
function makeIcon(L, emoji, bg, size = 36) {
    const r = size / 2;
    return L.divIcon({
        className:   "",
        iconAnchor:  [r, size],
        popupAnchor: [0, -size],
        html: `<div style="width:${size}px;height:${size}px;background:${bg};
            border-radius:${r}px ${r}px ${r}px 0;transform:rotate(-45deg);
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 3px 12px rgba(0,0,0,0.25);border:2.5px solid white;">
            <span style="transform:rotate(45deg);font-size:${Math.round(size*0.44)}px;line-height:1">${emoji}</span>
        </div>`,
    });
}

// ── Component ─────────────────────────────────────────────────────────────────
/**
 * @param {"checkout"|"tracking"} mode
 *
 * All coord props are { lat: number, lng: number } | null | undefined
 *
 * Shared props:
 *   restaurantCoords   — orange 🍽️ pin
 *   restaurantName     — popup text
 *   customerCoords     — green 📍 pin (geocoded delivery location)
 *   height             — px (default 250)
 *   borderRadius       — CSS string (default "14px")
 *
 * Checkout-only:
 *   onPinMoved(coords) — called after user drags the green pin
 *
 * Tracking-only:
 *   riderCoords        — yellow 🛵 pin (optional)
 *   deliveryLabel      — popup text for the green pin
 *   orderStatus        — drives the info badge text
 */
export function DeliveryMap({
                                mode            = "checkout",
                                restaurantCoords,
                                restaurantName  = "Restaurant",
                                customerCoords,
                                riderCoords,
                                deliveryLabel,
                                orderStatus,
                                onPinMoved,
                                height          = 250,
                                borderRadius    = "14px",
                            }) {
    const containerRef = useRef(null);
    const mapRef       = useRef(null);
    const markersRef   = useRef({});
    const lineRef      = useRef(null);
    const [ready,    setReady]    = useState(false);
    const [mapError, setMapError] = useState(null);

    // ── Initialise map once on mount ──────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        loadLeaflet()
            .then((L) => {
                if (cancelled || !containerRef.current) return;
                if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }

                // Rough starting centre — overridden by fitBounds once markers arrive
                const initialCenter = restaurantCoords
                    ? [restaurantCoords.lat, restaurantCoords.lng]
                    : customerCoords
                        ? [customerCoords.lat, customerCoords.lng]
                        : [9.082, 8.675]; // centre of Nigeria

                const map = L.map(containerRef.current, {
                    center:            initialCenter,
                    zoom:              14,
                    zoomControl:       true,
                    scrollWheelZoom:   false,
                    attributionControl: true,
                });

                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    maxZoom: 19,
                }).addTo(map);

                mapRef.current = map;
                setReady(true);
            })
            .catch(() => setMapError("Could not load map. Check your connection."));

        return () => { cancelled = true; };
    }, []); // intentionally empty — init once only

    // ── Sync markers and route line whenever coords change ────────────────────
    useEffect(() => {
        if (!ready || !mapRef.current || !window.L) return;
        const L   = window.L;
        const map = mapRef.current;
        const m   = markersRef.current;

        // Restaurant (orange)
        if (restaurantCoords) {
            const pos = [restaurantCoords.lat, restaurantCoords.lng];
            if (m.restaurant) {
                m.restaurant.setLatLng(pos);
            } else {
                m.restaurant = L.marker(pos, { icon: makeIcon(L, "🍽️", "#f97316") })
                    .addTo(map)
                    .bindPopup(`<b>${restaurantName}</b><br/><small>Restaurant</small>`);
            }
        }

        // Customer delivery pin (green)
        if (customerCoords) {
            const pos      = [customerCoords.lat, customerCoords.lng];
            const popupTxt = mode === "checkout"
                ? "<b>Your delivery pin</b><br/><small>Drag to adjust</small>"
                : `<b>${deliveryLabel || "Delivery location"}</b>`;

            if (m.customer) {
                m.customer.setLatLng(pos);
            } else {
                m.customer = L.marker(pos, {
                    icon:      makeIcon(L, "📍", "#2d8a2d"),
                    draggable: mode === "checkout",
                })
                    .addTo(map)
                    .bindPopup(popupTxt);

                if (mode === "checkout" && onPinMoved) {
                    m.customer.on("dragend", (e) => {
                        const { lat, lng } = e.target.getLatLng();
                        onPinMoved({ lat, lng });
                    });
                }
            }

            // Keep the marker in sync when the selected delivery location changes
            if (mode === "checkout") m.customer.setLatLng(pos);
        }

        // Rider pin (yellow, tracking only)
        if (mode === "tracking" && riderCoords) {
            const pos = [riderCoords.lat, riderCoords.lng];
            if (m.rider) {
                m.rider.setLatLng(pos);
            } else {
                m.rider = L.marker(pos, { icon: makeIcon(L, "🛵", "#f59e0b") })
                    .addTo(map)
                    .bindPopup("<b>Your rider</b><br/><small>On the way!</small>");
            }
        }

        // Dashed route line through all present points
        const points = [
            restaurantCoords ? [restaurantCoords.lat, restaurantCoords.lng] : null,
            mode === "tracking" && riderCoords ? [riderCoords.lat, riderCoords.lng] : null,
            customerCoords   ? [customerCoords.lat,   customerCoords.lng]   : null,
        ].filter(Boolean);

        if (points.length >= 2) {
            if (lineRef.current) {
                lineRef.current.setLatLngs(points);
            } else {
                lineRef.current = L.polyline(points, {
                    color: "#2d8a2d", weight: 3, opacity: 0.6, dashArray: "8 6",
                }).addTo(map);
            }
            try {
                map.fitBounds(L.latLngBounds(points), { padding: [44, 44], maxZoom: 16 });
            } catch (_) {}
        } else if (points.length === 1) {
            map.setView(points[0], 15);
        }
    }, [ready, restaurantCoords, customerCoords, riderCoords, mode, restaurantName, deliveryLabel]);

    // ── Destroy map on unmount ────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
            markersRef.current = {};
            lineRef.current    = null;
        };
    }, []);

    // ── Badge text ────────────────────────────────────────────────────────────
    const badge = mode === "checkout"
        ? "📍 Drag green pin to adjust"
        : ["PICKED_UP", "DELIVERED"].includes(orderStatus)
            ? "🛵 Rider en route"
            : "📍 Delivery location";

    // ── Error fallback ────────────────────────────────────────────────────────
    if (mapError) return (
        <div style={{ height, borderRadius, background: "#f4f8f4", border: "1.5px solid #d8eed8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#8aaa8a", fontSize: 13, gap: 6 }}>
            <span style={{ fontSize: 28 }}>🗺️</span>
            <span>{mapError}</span>
        </div>
    );

    return (
        <div style={{ position: "relative", height, borderRadius, overflow: "hidden", border: "1.5px solid #d8eed8" }}>
            {/* Map tile container */}
            <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

            {/* Spinner overlay while Leaflet loads */}
            {!ready && (
                <div style={{ position: "absolute", inset: 0, background: "#f4f8f4", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#8aaa8a", fontSize: 13 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.9s linear infinite" }}>
                        <circle cx="12" cy="12" r="10" stroke="#d4e8d4" strokeWidth="3"/>
                        <path d="M12 2a10 10 0 0110 10" stroke="#2d8a2d" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Loading map…
                </div>
            )}

            {/* Info badge */}
            {ready && (
                <div style={{ position: "absolute", top: 10, left: 10, zIndex: 500, background: "white", borderRadius: 20, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: "#2d8a2d", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", border: "1px solid #d8eed8" }}>
                    {badge}
                </div>
            )}
        </div>
    );
}