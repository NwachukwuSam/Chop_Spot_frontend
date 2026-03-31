/**
 * useUserProfile
 *
 * Fetches the logged-in user's full UserProfile from GET /api/users/profile.
 * Caches it in localStorage under "chopspot_profile" so it survives page
 * refreshes without an extra API call on every mount.
 *
 * Returns:
 *   profile      — the UserProfile object (or null if not loaded yet)
 *   profileLoading
 *   saveProfile  — call after checkout to persist delivery fields back to server
 *   refreshProfile — force a re-fetch from the API
 */

import { useState, useEffect, useCallback } from "react";
import { userProfileApi } from "../utils/Api";

const PROFILE_KEY = "chopspot_profile";

function readCached() {
    try {
        const raw = localStorage.getItem(PROFILE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function writeCache(profile) {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch (_) {}
}

export function useUserProfile({ isLoggedIn }) {
    const [profile,        setProfile]        = useState(readCached);
    const [profileLoading, setProfileLoading] = useState(false);

    // ── Fetch from API ────────────────────────────────────────────────────────
    const fetchProfile = useCallback(async () => {
        if (!isLoggedIn) return;
        setProfileLoading(true);
        try {
            const data = await userProfileApi.getProfile();
            setProfile(data);
            writeCache(data);
        } catch (err) {
            console.warn("Could not load user profile:", err.message);
            // Fall back to cached version — no crash
        } finally {
            setProfileLoading(false);
        }
    }, [isLoggedIn]);

    // Fetch on login
    useEffect(() => {
        if (isLoggedIn) {
            fetchProfile();
        } else {
            // Logged out — clear profile
            setProfile(null);
            try { localStorage.removeItem(PROFILE_KEY); } catch (_) {}
        }
    }, [isLoggedIn, fetchProfile]);

    // ── Save delivery fields back to server ───────────────────────────────────
    /**
     * Call after checkout when the user ticks "Save my details".
     * Sends only the delivery fields to PUT /api/users/profile.
     */
    const saveProfile = useCallback(async (fields) => {
        try {
            const updated = await userProfileApi.updateProfile(fields);
            setProfile(updated);
            writeCache(updated);
        } catch (err) {
            console.warn("Could not save profile:", err.message);
            // Still update local state so the UI reflects the change
            setProfile(prev => ({ ...prev, ...fields }));
            writeCache({ ...profile, ...fields });
        }
    }, [profile]);

    const refreshProfile = fetchProfile;

    return { profile, profileLoading, saveProfile, refreshProfile };
}