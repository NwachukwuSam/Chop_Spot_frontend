/**
 * useGeocoder.js
 *
 * Converts any text address or location label → { lat, lng }
 * using Nominatim (OpenStreetMap). 100% free, no API key needed.
 *
 * CAMPUS HINT:
 *   Set VITE_CAMPUS_HINT in your .env to your campus name/area.
 *   This is appended to every geocoding query to anchor ambiguous
 *   labels like "Hall 1" or "Porter's Lodge" to the right place.
 *
 *   Example (.env):
 *     VITE_CAMPUS_HINT=Babcock University, Ilishan-Remo, Ogun State
 *
 * CACHING:
 *   Results are cached in-memory for the session so the same
 *   string is never geocoded twice. Nominatim has a 1 req/s limit.
 *
 * BACKEND NOTE:
 *   When a vendor saves their restaurant address, geocode it once
 *   server-side and store lat + lng on the restaurant record.
 *   The frontend can then use those coordinates directly and skip
 *   geocoding entirely for restaurants.
 */

const NOMINATIM   = "https://nominatim.openstreetmap.org/search";
const CAMPUS_HINT = import.meta.env.VITE_CAMPUS_HINT || "";

// Session-scoped cache — survives re-renders, cleared on page reload
const cache = new Map();

// Rate-limit: Nominatim requires max 1 request per second
let lastRequestTime = 0;
const MIN_INTERVAL_MS = 1100;

async function rateLimitedFetch(url) {
    const wait = Math.max(0, MIN_INTERVAL_MS - (Date.now() - lastRequestTime));
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
    lastRequestTime = Date.now();

    const res = await fetch(url, {
        headers: {
            // Nominatim ToS: must include a descriptive User-Agent
            "User-Agent":      "ChopSpot-FoodDelivery/1.0 (contact@chopspot.ng)",
            "Accept-Language": "en",
        },
    });
    return res.json();
}

/**
 * Geocode any address or location label to { lat, lng }.
 *
 * If VITE_CAMPUS_HINT is set, it's appended to the query so that
 * generic labels like "Porter's Lodge (₦300)" resolve correctly.
 *
 * The fee suffix "(₦300)" is stripped before geocoding.
 *
 * Returns null if the address cannot be resolved.
 */
export async function geocodeAddress(address) {
    if (!address?.trim()) return null;

    // Strip currency/fee suffixes: "Porter's Lodge (₦300)" → "Porter's Lodge"
    const clean = address.replace(/\s*\(₦[\d,]+\)/g, "").trim();

    // Build the full query — append campus hint if available
    const fullQuery = CAMPUS_HINT ? `${clean}, ${CAMPUS_HINT}` : clean;
    const cacheKey  = fullQuery.toLowerCase();

    if (cache.has(cacheKey)) return cache.get(cacheKey);

    try {
        const url     = `${NOMINATIM}?q=${encodeURIComponent(fullQuery)}&format=json&limit=1&countrycodes=ng`;
        const results = await rateLimitedFetch(url);

        if (!results?.length) {
            cache.set(cacheKey, null);
            return null;
        }

        const { lat, lon } = results[0];
        const coords = { lat: parseFloat(lat), lng: parseFloat(lon) };
        cache.set(cacheKey, coords);
        return coords;
    } catch (err) {
        console.warn("[useGeocoder] Failed to geocode:", address, err.message);
        cache.set(cacheKey, null);
        return null;
    }
}

/**
 * React hook that exposes geocodeAddress as a stable callback.
 */
import { useCallback } from "react";

export function useGeocoder() {
    const geocode = useCallback(geocodeAddress, []);
    return { geocode };
}