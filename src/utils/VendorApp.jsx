
import { useAuth } from "../hooks/useAuth";
import {vendorApi} from "./Api.js";
import { useState, useEffect } from "react";
import VendorRegister from "../auth/VendoRegister.jsx";
import VendorDashboard from "../dashboards/VendorDashboard.jsx";
/**
 * VendorApp
 * Drop this anywhere in your React app.
 * It reads `chopspot_vendor` from localStorage.
 * If found → show Dashboard. Otherwise → show Registration.
 * Pass `onExitToHome` prop to add a "Back to Home" button.
 */
export default function VendorApp({ onExitToHome }) {
    const { isLoggedIn, user } = useAuth();
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoggedIn) { setLoading(false); return; }
        vendorApi.getProfile()
            .then(setVendor)
            .catch(() => setVendor(null))
            .finally(() => setLoading(false));
    }, [isLoggedIn]);

    if (loading) return <LoadingScreen />;

    // Not logged in → send to login
    if (!isLoggedIn) {
        window.location.href = "/login";
        return null;
    }

    // Logged in but no vendor profile → show registration
    if (!vendor) return <VendorRegister onSuccess={setVendor} />;

    return <VendorDashboard initialVendor={vendor} onLogout={onExitToHome} />;
}