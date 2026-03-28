import { useState, useCallback } from "react";

const TOKEN_KEY = "chopspot_token";
const USER_KEY  = "chopspot_user";

/**
 * useAuth — reads/writes auth state from localStorage.
 *
 * Exposes:
 *   isLoggedIn  — true if a JWT token exists
 *   user        — full parsed user object (id, email, roles, etc.) or null
 *   userId      — shortcut for user?.id  (used by useCart to key the cart)
 *   logout      — clears all auth keys + resets state
 *   refresh     — re-reads localStorage (call after a login redirect)
 */
export function useAuth() {
    const readState = () => {
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            const raw   = localStorage.getItem(USER_KEY);
            const user  = raw ? JSON.parse(raw) : null;
            return {
                isLoggedIn: Boolean(token),
                user,
                userId: user?.id ?? null,
            };
        } catch {
            return { isLoggedIn: false, user: null, userId: null };
        }
    };

    const [auth, setAuth] = useState(readState);

    const logout = useCallback(() => {
        try {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem("adminToken");
            localStorage.removeItem("token");
            localStorage.removeItem(USER_KEY);
        } catch (_) {}
        setAuth({ isLoggedIn: false, user: null, userId: null });
    }, []);

    const refresh = useCallback(() => {
        setAuth(readState());
    }, []);

    return { ...auth, logout, refresh };
}