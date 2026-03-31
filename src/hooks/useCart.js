/**
 * useCart — Smart cart hook for ChopSpot
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  STRATEGY                                                       │
 * │                                                                 │
 * │  GUEST (not logged in)                                          │
 * │    → cart stored in localStorage under key:                     │
 * │      "chopspot_cart_guest"                                      │
 * │    → fast, offline-capable, zero API calls                      │
 * │                                                                 │
 * │  LOGGED IN                                                      │
 * │    → cart stored on SERVER via cartApi                          │
 * │    → localStorage is NOT used for the active cart               │
 * │    → on mount, fetches server cart                              │
 * │                                                                 │
 * │  ON LOGIN (mergeGuestCartOnLogin)                               │
 * │    → send guest localStorage cart → POST /api/cart/merge        │
 * │    → server merges with any existing server cart                │
 * │    → wipe "chopspot_cart_guest" from localStorage               │
 * │    → update local state with merged result                      │
 * │                                                                 │
 * │  PROBLEMS SOLVED                                                │
 * │    ✅ Different users on same device  → separate keyed carts    │
 * │    ✅ Same user on different devices  → server cart syncs       │
 * │    ✅ Login clears guest cart — other users can't see it        │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * Cart group shape (unchanged from previous version):
 *   {
 *     vendor: { id, name, image },
 *     pack:   null | { id, name, price },
 *     items:  [{ id, name, price, qty }]
 *   }
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { cartApi } from "../utils/Api";

// ─── localStorage key helpers ─────────────────────────────────────────────────

const GUEST_KEY = "chopspot_cart_guest";
const userKey   = (userId) => `chopspot_cart_user_${userId}`;

function readLocal(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeLocal(key, groups) {
    try { localStorage.setItem(key, JSON.stringify(groups)); } catch (_) {}
}

function removeLocal(key) {
    try { localStorage.removeItem(key); } catch (_) {}
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * @param {object} params
 * @param {boolean}     params.isLoggedIn
 * @param {string|null} params.userId      — null when guest
 */
export function useCart({ isLoggedIn, userId, onError }) {
    const [cartGroups, setCartGroups] = useState([]);
    const [cartLoading, setCartLoading] = useState(false);
    const [cartError,   setCartError]   = useState(null);
    const initialFetchDone = useRef(false);

    // ── On auth state change: load the right cart ───────────────────────────
    useEffect(() => {
        if (isLoggedIn && userId) {
            if (!initialFetchDone.current) {
                initialFetchDone.current = true;
                fetchServerCart();
            }
        } else {
            initialFetchDone.current = false;
            setCartGroups(readLocal(GUEST_KEY));
        }
    }, [isLoggedIn, userId]);

    // ── Fetch server cart ────────────────────────────────────────────────────
    const fetchServerCart = useCallback(async () => {
        setCartLoading(true);
        setCartError(null);
        try {
            const data   = await cartApi.getCart();
            const groups = Array.isArray(data) ? data : (data?.groups ?? []);
            setCartGroups(groups);
            if (userId) writeLocal(userKey(userId), groups);
        } catch (err) {
            console.error("🛒 Failed to fetch server cart:", err);
            setCartError("Could not load your cart.");
            // Fall back to local backup
            if (userId) {
                const backup = readLocal(userKey(userId));
                if (backup.length > 0) setCartGroups(backup);
            }
        } finally {
            setCartLoading(false);
        }
    }, [userId]);

    // ── Add a group ──────────────────────────────────────────────────────────
    const addGroup = useCallback(async (group) => {
        // Optimistic — instant UI feedback
        setCartGroups(prev => {
            const next = [...prev, group];
            if (!isLoggedIn) writeLocal(GUEST_KEY, next);
            else if (userId) writeLocal(userKey(userId), next);
            return next;
        });

        if (isLoggedIn) {
            try {
                const data   = await cartApi.addGroup(group);
                const groups = Array.isArray(data) ? data : (data?.groups ?? null);
                if (groups) {
                    setCartGroups(groups);
                    if (userId) writeLocal(userKey(userId), groups);
                }
            } catch (err) {
                console.error("🛒 addGroup server error:", err);
                onError?.("Failed to save item to cart. It's saved locally.");
            }
        }
    }, [isLoggedIn, userId]);

    // ── Remove a group ───────────────────────────────────────────────────────
    const removeGroup = useCallback(async (idx) => {
        setCartGroups(prev => {
            const next = prev.filter((_, i) => i !== idx);
            if (!isLoggedIn) writeLocal(GUEST_KEY, next);
            else if (userId) writeLocal(userKey(userId), next);
            return next;
        });

        if (isLoggedIn) {
            try {
                const data   = await cartApi.removeGroup(idx);
                const groups = Array.isArray(data) ? data : (data?.groups ?? null);
                if (groups) {
                    setCartGroups(groups);
                    if (userId) writeLocal(userKey(userId), groups);
                }
            } catch (err) {
                console.error("🛒 removeGroup server error:", err);
                onError?.("Could not remove item from server. Try refreshing.");
            }
        }
    }, [isLoggedIn, userId]);

    // ── Clear cart ────────────────────────────────────────────────────────────
    const clearCart = useCallback(async () => {
        setCartGroups([]);
        if (!isLoggedIn) {
            removeLocal(GUEST_KEY);
        } else {
            if (userId) removeLocal(userKey(userId));
            try { await cartApi.clearCart(); } catch (err) {
                console.error("🛒 clearCart server error:", err);
                onError?.("Could not clear server cart.");
            }
        }
    }, [isLoggedIn, userId]);

    /**
     * mergeGuestCartOnLogin
     *
     * Call this ONCE right after successful login (in the Home.jsx useEffect
     * that detects location.state.openCheckout, or anywhere you handle the
     * post-login redirect).
     *
     * What happens:
     *   1. Read guest cart from "chopspot_cart_guest" in localStorage
     *   2. If non-empty → POST /api/cart/merge  (server merges + returns result)
     *   3. If empty     → GET  /api/cart        (just load user's server cart)
     *   4. Wipe guest key regardless
     *   5. Set local state to merged/server result
     */
    const mergeGuestCartOnLogin = useCallback(async () => {
        const guestGroups = readLocal(GUEST_KEY);
        try {
            if (guestGroups.length > 0) {
                console.log(`🛒 Merging ${guestGroups.length} guest group(s) into server cart…`);
                const data   = await cartApi.mergeGuestCart(guestGroups);
                const merged = Array.isArray(data) ? data : (data?.groups ?? []);
                setCartGroups(merged);
                if (userId) writeLocal(userKey(userId), merged);
            } else {
                await fetchServerCart();
            }
        } catch (err) {
            console.error("🛒 Cart merge failed:", err);
            onError?.("Cart sync failed — your items are still saved locally.");
            await fetchServerCart();
        } finally {
            removeLocal(GUEST_KEY);
        }
    }, [userId, fetchServerCart]);

    // ── Derived ───────────────────────────────────────────────────────────────
    const totalItems = cartGroups.reduce(
        (a, g) => a + g.items.reduce((s, i) => s + i.qty, 0),
        0
    );

    return {
        cartGroups,
        cartLoading,
        cartError,
        addGroup,
        removeGroup,
        clearCart,
        mergeGuestCartOnLogin,
        totalItems,
    };
}